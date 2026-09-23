import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import './dashboard.css';
import { SERVER_URL } from "../../constants/server_url";
import '../../colors.css';
import { ADOPTION_STATUSES } from "../../../../backend/src/constants/enums";

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, adopted: 0, available: 0, reserved: 0 });
    const [requests, setRequests] = useState([]);
    const [colors, setColors] = useState(["#ccc", "#ccc", "#ccc"]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        setColors([
            rootStyles.getPropertyValue('--color-red').trim(),
            rootStyles.getPropertyValue('--color-green').trim(),
            rootStyles.getPropertyValue('--color-yellow').trim()
        ]);
    }, []);

    const fetchUnapprovedRequests = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/adoption-requests`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const unapproved = res.data
                .filter(req => req.approved === false)
                .sort((a, b) => new Date(a.pickupDateTime) - new Date(b.pickupDateTime));
            setRequests(unapproved);
        } catch (err) {
            console.error("Eroare la preluarea cererilor:", err);
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/contact`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const sortedMessages = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setMessages(sortedMessages);
            } catch (error) {
                console.error("Failed to fetch contact messages:", error);
            }
        };

        fetchMessages();
    }, []);

    const handleDeleteMessage = async (id) => {
        try {
            await axios.delete(`${SERVER_URL}/contact/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setMessages(prev => prev.filter(msg => msg.id !== id));
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };


    const fetchStats = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/pets`);
            const data = res.data.animals;

            const adopted = data.filter(a => a.adoption_status === "Adoptat").length;
            const reserved = data.filter(a => a.adoption_status === "Rezervat").length;
            const available = data.filter(a => a.adoption_status === "Disponibil").length;

            return {
                total: available + reserved,
                adopted,
                available,
                reserved
            };
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            return {
                total: 0,
                adopted: 0,
                available: 0,
                reserved: 0
            };
        }
    };

    useEffect(() => {
        const getStats = async () => {
            const stats = await fetchStats();
            setStats(stats);
        };

        getStats();
        fetchUnapprovedRequests();
    }, []);

    const handleAccept = async (requestId) => {
        try {
            const request = requests.find(req => req.id === requestId);
            if (!request) return;

            await axios.put(`${SERVER_URL}/pets/${request.animalId}`, {
                adoption_status: ADOPTION_STATUSES.ADOPTAT
            });

            await axios.put(
                `${SERVER_URL}/adoption-requests/${requestId}`,
                { approved: true },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const updatedStats = await fetchStats();
            setStats(updatedStats);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Eroare la acceptarea cererii:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.delete(`${SERVER_URL}/adoption-requests/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const request = requests.find(req => req.id === id);
            if (request?.animalId) {
                await axios.put(`${SERVER_URL}/pets/${request.animalId}`, {
                    adoption_status: ADOPTION_STATUSES.DISPONIBIL
                });

                await axios.post(`${SERVER_URL}/notify-requests/notify-availability`, { animalId: request.animalId }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            }

            const updatedStats = await fetchStats();
            setStats(updatedStats);
            setRequests(prev => prev.filter(req => req.id !== id));
        } catch (error) {
            console.error("Eroare la respingerea cererii:", error);
        }
    };

    const data = [
        { name: "Adoptat", value: stats.adopted },
        { name: "Disponibil", value: stats.available },
        { name: "Rezervat", value: stats.reserved },
    ];

    return (
        <div className="dashboard page">
            <h1 className="title">Panoul de control</h1>

            <div className="info-cards">
                <div className="dashboard-info"><h2>Animale în centru</h2><p>{stats.total}</p></div>
                <div className="dashboard-info"><h2>Animale adoptate</h2><p>{stats.adopted}</p></div>
                <div className="dashboard-info"><h2>Animale rezervate</h2><p>{stats.reserved}</p></div>
            </div>

            <div className="main-panels">
                <div className="adoption-requests">
                    <h2>Cereri de adopție</h2>
                    {requests.length === 0 ? (
                        <p>Nicio cerere momentan.</p>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="request-card">
                                <p><strong>Nume:</strong> {req.adopter_first_name} {req.adopter_last_name}</p>
                                <p><strong>Email:</strong> {req.adopter_email}</p>
                                <p><strong>Telefon:</strong> {req.adopter_phone_number}</p>
                                <p><strong>Mesaj:</strong> {req.message || "–"}</p>
                                <p><strong>Animal:</strong> {req.animal?.name} ({req.animal?.species})</p>
                                <p><strong>Ziua aleasă:</strong> {new Date(req.pickup_datetime).toLocaleString()}</p>
                                <div className="request-buttons">
                                    <button className="accept" onClick={() => handleAccept(req.id)}>Acceptă</button>
                                    <button className="reject" onClick={() => handleReject(req.id)}>Respinge</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="contact-messages">
                    <h2>Mesaje</h2>
                    {messages.length === 0 ? (
                        <p>Niciun mesaj momentan.</p>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className="message-card">
                                <p><strong>Nume:</strong> {msg.name}</p>
                                <p><strong>Email:</strong> {msg.email}</p>
                                <p><strong>Mesaj:</strong> {msg.message}</p>
                                <p><strong>Primit:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                                <div className="request-buttons">
                                    <button className="reject " onClick={() => handleDeleteMessage(msg.id)}>Șterge</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
