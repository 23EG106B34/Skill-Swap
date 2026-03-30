import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { getUsers, toApiError } from '../api'

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function CommunityPage({ currentUser, notify }) {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const loadUsers = async () => {
        setIsLoading(true)
        try {
            const usersData = await getUsers()
            setUsers(usersData)
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const communityUsers = useMemo(
        () => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName)),
        [users],
    )

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return communityUsers
        return communityUsers.filter(
            (user) =>
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [communityUsers, searchTerm])

    if (isLoading) {
        return (
            <div className="community-page">
                <p className="loading-line">Loading community...</p>
            </div>
        )
    }

    return (
        <div className="community-page">
            <motion.section className="page-header" {...itemAnimation}>
                <h2>Community</h2>
                <p>Connect with fellow learners and teachers.</p>
            </motion.section>

            <motion.section className="filters-section" {...itemAnimation}>
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search by name or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </motion.section>

            <motion.section className="community-grid" {...itemAnimation}>
                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>No users found</h3>
                        <p>Try adjusting your search.</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <article key={user.id} className="community-card">
                            <div className="user-avatar">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <h4>{user.fullName}</h4>
                                <p className="department">{user.department}</p>
                                <p className="year">Year {user.yearOfStudy}</p>
                                {user.bio && <p className="bio">{user.bio}</p>}
                            </div>
                        </article>
                    ))
                )}
            </motion.section>
        </div>
    )
}

export default CommunityPage