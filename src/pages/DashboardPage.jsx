import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Handshake, Radar, Rocket, Users } from 'lucide-react'
import { getDashboard, toApiError } from '../api'

const metricCards = [
    { key: 'activeUsers', label: 'Active Learners', icon: Users },
    { key: 'activeSkills', label: 'Live Skill Listings', icon: Radar },
    { key: 'incomingPendingRequests', label: 'Incoming Requests', icon: Handshake },
    { key: 'outgoingPendingRequests', label: 'Outgoing Requests', icon: Rocket },
]

const emptyDashboard = {
    activeUsers: 0,
    activeSkills: 0,
    incomingPendingRequests: 0,
    outgoingPendingRequests: 0,
    recommendations: [],
}

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function DashboardPage({ currentUser, notify }) {
    const [dashboard, setDashboard] = useState(emptyDashboard)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            if (!currentUser?.id) return

            setIsLoading(true)
            try {
                const dashboardData = await getDashboard(currentUser.id)
                setDashboard({ ...emptyDashboard, ...dashboardData })
            } catch (error) {
                notify('error', toApiError(error))
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboard()
    }, [currentUser, notify])

    if (!currentUser) {
        return (
            <div className="dashboard-page">
                <motion.section className="auth-required" {...itemAnimation}>
                    <h2>Dashboard</h2>
                    <p>Please log in to view your dashboard.</p>
                </motion.section>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <p className="loading-line">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            <motion.section className="page-header" {...itemAnimation}>
                <h2>Dashboard</h2>
                <p>Welcome back, {currentUser.fullName}!</p>
            </motion.section>

            <motion.section className="metrics-grid" {...itemAnimation}>
                {metricCards.map(({ key, label, icon: Icon }) => (
                    <article key={key} className="metric-tile">
                        <div className="metric-icon">
                            <Icon size={18} />
                        </div>
                        <p>{label}</p>
                        <strong>{dashboard[key] ?? 0}</strong>
                    </article>
                ))}
            </motion.section>

            <motion.section className="recommendations-section" {...itemAnimation}>
                <div className="panel-head">
                    <Radar size={18} />
                    <h3>Smart Recommendations</h3>
                </div>
                <div className="stack-list">
                    {dashboard.recommendations?.length ? (
                        dashboard.recommendations.map((match) => (
                            <article key={match.skill.id} className="mini-card recommendation-card">
                                <h4>{match.skill.title}</h4>
                                <p>{match.skill.ownerName}</p>
                                <div className="chip-row">
                                    <span>Match {match.matchScore}%</span>
                                    <span>{match.skill.category}</span>
                                </div>
                                <small>{match.reason}</small>
                            </article>
                        ))
                    ) : (
                        <p className="empty-line">Create more listings to unlock targeted recommendations.</p>
                    )}
                </div>
            </motion.section>
        </div>
    )
}

export default DashboardPage