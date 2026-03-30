import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Radar, Handshake, X } from 'lucide-react'
import { getMarketplaceSkills, getSkillsByOwner, createSwapRequest, toApiError } from '../api'

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function MarketplacePage({ currentUser, notify, refreshKey }) {
    const [marketplaceSkills, setMarketplaceSkills] = useState([])
    const [mySkills, setMySkills] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [selectedSkill, setSelectedSkill] = useState(null)
    const [requestForm, setRequestForm] = useState({
        offeredSkillId: '',
        message: '',
    })

    const loadMarketplace = async () => {
        setIsLoading(true)
        try {
            const skillsData = await getMarketplaceSkills()
            setMarketplaceSkills(skillsData)
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    const loadMySkills = async () => {
        if (!currentUser?.id) return
        try {
            const mySkillsData = await getSkillsByOwner(currentUser.id)
            setMySkills(mySkillsData.filter((skill) => skill.active && skill.type === 'OFFERING'))
        } catch (error) {
            notify('error', toApiError(error))
        }
    }

    useEffect(() => {
        loadMarketplace()
        loadMySkills()
    }, [currentUser, refreshKey])

    const handleOpenRequestModal = (skill) => {
        if (!currentUser) {
            notify('error', 'Please login to request a skill.')
            return
        }
        setSelectedSkill(skill)
        setRequestForm({ offeredSkillId: '', message: '' })
        setShowRequestModal(true)
    }

    const handleCloseRequestModal = () => {
        setShowRequestModal(false)
        setSelectedSkill(null)
        setRequestForm({ offeredSkillId: '', message: '' })
    }

    const handleRequestSubmit = async (event) => {
        event.preventDefault()
        if (!currentUser?.id || !selectedSkill) return

        try {
            const payload = {
                senderId: currentUser.id,
                receiverId: selectedSkill.ownerId,
                offeredSkillId: Number(requestForm.offeredSkillId),
                requestedSkillId: selectedSkill.id,
                message: requestForm.message,
            }
            await createSwapRequest(payload)
            notify('success', 'Swap request sent successfully.')
            handleCloseRequestModal()
        } catch (error) {
            notify('error', toApiError(error))
        }
    }

    const marketplaceOfferings = useMemo(
        () =>
            marketplaceSkills.filter(
                (skill) => skill.active && skill.type === 'OFFERING' && skill.ownerId !== currentUser?.id,
            ),
        [marketplaceSkills, currentUser],
    )

    const categories = useMemo(() => {
        const cats = new Set(marketplaceOfferings.map((skill) => skill.category))
        return Array.from(cats).sort()
    }, [marketplaceOfferings])

    const filteredSkills = useMemo(() => {
        return marketplaceOfferings.filter((skill) => {
            const matchesSearch =
                !searchTerm ||
                skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.ownerName.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = !categoryFilter || skill.category === categoryFilter
            const matchesType = !typeFilter || skill.type === typeFilter

            return matchesSearch && matchesCategory && matchesType
        })
    }, [marketplaceOfferings, searchTerm, categoryFilter, typeFilter])

    if (isLoading) {
        return (
            <div className="marketplace-page">
                <p className="loading-line">Loading marketplace...</p>
            </div>
        )
    }

    return (
        <div className="marketplace-page">
            <motion.section className="page-header" {...itemAnimation}>
                <h2>Marketplace</h2>
                <p>Browse skills available for exchange from the community.</p>
            </motion.section>

            <motion.section className="filters-section" {...itemAnimation}>
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search skills, categories, or users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.section>

            <motion.section className="marketplace-grid" {...itemAnimation}>
                {filteredSkills.length === 0 ? (
                    <div className="empty-state">
                        <Radar size={48} />
                        <h3>No skills found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredSkills.map((skill) => (
                        <article key={skill.id} className="marketplace-card">
                            <div className="card-header">
                                <h4>{skill.title}</h4>
                                <span className="category-badge">{skill.category}</span>
                            </div>
                            <p className="card-description">{skill.description}</p>
                            <div className="card-meta">
                                <span className="owner">by {skill.ownerName}</span>
                                <span className="delivery-mode">{skill.deliveryMode}</span>
                                <span className="hours">{skill.weeklyHours}h/week</span>
                            </div>
                            {currentUser && (
                                <button
                                    className="primary-btn request-btn"
                                    onClick={() => handleOpenRequestModal(skill)}
                                >
                                    <Handshake size={16} /> Request Skill
                                </button>
                            )}
                        </article>
                    ))
                )}
            </motion.section>

            {showRequestModal && selectedSkill && (
                <div className="modal-overlay" onClick={handleCloseRequestModal}>
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="modal-header">
                            <h3>Request Skill: {selectedSkill.title}</h3>
                            <button className="modal-close" onClick={handleCloseRequestModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form className="form-grid" onSubmit={handleRequestSubmit}>
                            <div className="form-info">
                                <p><strong>From:</strong> {selectedSkill.ownerName}</p>
                                <p><strong>Category:</strong> {selectedSkill.category}</p>
                            </div>
                            <select
                                value={requestForm.offeredSkillId}
                                onChange={(e) =>
                                    setRequestForm((prev) => ({ ...prev, offeredSkillId: e.target.value }))
                                }
                                required
                            >
                                <option value="">Select your skill to offer</option>
                                {mySkills.map((skill) => (
                                    <option value={skill.id} key={skill.id}>
                                        {skill.title} ({skill.category})
                                    </option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Message (optional)"
                                value={requestForm.message}
                                onChange={(e) =>
                                    setRequestForm((prev) => ({ ...prev, message: e.target.value }))
                                }
                            />
                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={handleCloseRequestModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn">
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default MarketplacePage