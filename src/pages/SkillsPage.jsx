import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, UserRoundCheck } from 'lucide-react'
import { createSkill, getSkillsByOwner, toApiError } from '../api'

const initialSkillForm = {
    title: '',
    category: '',
    description: '',
    type: 'OFFERING',
    deliveryMode: 'HYBRID',
    weeklyHours: 3,
}

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function SkillsPage({ currentUser, notify, onDataChange }) {
    const [mySkills, setMySkills] = useState([])
    const [skillForm, setSkillForm] = useState(initialSkillForm)
    const [isLoading, setIsLoading] = useState(true)

    const loadSkills = async () => {
        if (!currentUser?.id) return

        setIsLoading(true)
        try {
            const mySkillsData = await getSkillsByOwner(currentUser.id)
            setMySkills(mySkillsData)
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSkills()
    }, [currentUser])

    const myOfferingSkills = useMemo(
        () => mySkills.filter((skill) => skill.active && skill.type === 'OFFERING'),
        [mySkills],
    )

    const handleCreateSkill = async (event) => {
        event.preventDefault()
        if (!currentUser?.id) {
            notify('error', 'Login required to publish a skill.')
            return
        }

        try {
            const payload = {
                ...skillForm,
                weeklyHours: Number(skillForm.weeklyHours),
            }
            await createSkill(currentUser.id, payload)
            setSkillForm(initialSkillForm)
            notify('success', 'Skill listing published to the marketplace.')
            await loadSkills()
            if (onDataChange) {
                onDataChange()
            }
        } catch (error) {
            notify('error', toApiError(error))
        }
    }

    if (!currentUser) {
        return (
            <div className="skills-page">
                <motion.section className="auth-required" {...itemAnimation}>
                    <h2>My Skills</h2>
                    <p>Please log in to manage your skills.</p>
                </motion.section>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="skills-page">
                <p className="loading-line">Loading skills...</p>
            </div>
        )
    }

    return (
        <div className="skills-page">
            <motion.section className="page-header" {...itemAnimation}>
                <h2>My Skills</h2>
                <p>Manage your skill listings and publish new offerings.</p>
            </motion.section>

            <section className="workspace-grid">
                <motion.article className="panel" {...itemAnimation}>
                    <div className="panel-head">
                        <Lightbulb size={18} />
                        <h3>Publish a skill</h3>
                    </div>
                    <form className="form-grid" onSubmit={handleCreateSkill}>
                        <input
                            type="text"
                            placeholder="Listing title"
                            value={skillForm.title}
                            onChange={(event) => setSkillForm((prev) => ({ ...prev, title: event.target.value }))}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Category (React, Python, CAD...)"
                            value={skillForm.category}
                            onChange={(event) =>
                                setSkillForm((prev) => ({ ...prev, category: event.target.value }))
                            }
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={skillForm.description}
                            onChange={(event) =>
                                setSkillForm((prev) => ({ ...prev, description: event.target.value }))
                            }
                            required
                        />
                        <div className="split-fields">
                            <select
                                value={skillForm.type}
                                onChange={(event) => setSkillForm((prev) => ({ ...prev, type: event.target.value }))}
                            >
                                <option value="OFFERING">I can teach</option>
                                <option value="LEARNING">I want to learn</option>
                            </select>
                            <select
                                value={skillForm.deliveryMode}
                                onChange={(event) =>
                                    setSkillForm((prev) => ({ ...prev, deliveryMode: event.target.value }))
                                }
                            >
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE">Offline</option>
                                <option value="HYBRID">Hybrid</option>
                            </select>
                        </div>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            placeholder="Hours per week"
                            value={skillForm.weeklyHours}
                            onChange={(event) =>
                                setSkillForm((prev) => ({ ...prev, weeklyHours: event.target.value }))
                            }
                            required
                        />
                        <button className="primary-btn" type="submit">
                            Publish listing
                        </button>
                    </form>
                </motion.article>

                <motion.article className="panel" {...itemAnimation}>
                    <div className="panel-head">
                        <UserRoundCheck size={18} />
                        <h3>My skill map</h3>
                    </div>
                    <div className="stack-list">
                        {mySkills.length === 0 ? (
                            <p className="empty-line">No listings yet. Publish your first skill.</p>
                        ) : (
                            mySkills.map((skill) => (
                                <article key={skill.id} className="mini-card">
                                    <h4>{skill.title}</h4>
                                    <p>{skill.category}</p>
                                    <span className={`skill-type-badge ${skill.type.toLowerCase()}`}>
                                        {skill.type}
                                    </span>
                                </article>
                            ))
                        )}
                    </div>
                </motion.article>
            </section>
        </div>
    )
}

export default SkillsPage