import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Ban, CheckCircle2, Handshake, Rocket, XCircle } from 'lucide-react'
import {
    createSwapRequest,
    getInboxRequests,
    getOutboxRequests,
    getSkillsByOwner,
    getMarketplaceSkills,
    updateSwapRequest,
    toApiError,
} from '../api'

const initialSwapForm = {
    receiverId: '',
    offeredSkillId: '',
    requestedSkillId: '',
    message: '',
}

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function RequestsPage({ currentUser, notify, onDataChange }) {
    const [inbox, setInbox] = useState([])
    const [outbox, setOutbox] = useState([])
    const [mySkills, setMySkills] = useState([])
    const [marketplaceSkills, setMarketplaceSkills] = useState([])
    const [swapForm, setSwapForm] = useState(initialSwapForm)
    const [isLoading, setIsLoading] = useState(true)

    const loadData = async () => {
        if (!currentUser?.id) return

        setIsLoading(true)
        try {
            const [inboxData, outboxData, mySkillsData, marketplaceData] = await Promise.all([
                getInboxRequests(currentUser.id),
                getOutboxRequests(currentUser.id),
                getSkillsByOwner(currentUser.id),
                getMarketplaceSkills(),
            ])
            setInbox(inboxData)
            setOutbox(outboxData)
            setMySkills(mySkillsData)
            setMarketplaceSkills(marketplaceData)
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [currentUser])

    const myOfferingSkills = useMemo(
        () => mySkills.filter((skill) => skill.active && skill.type === 'OFFERING'),
        [mySkills],
    )

    const marketplaceOfferings = useMemo(
        () =>
            marketplaceSkills.filter(
                (skill) => skill.active && skill.type === 'OFFERING' && skill.ownerId !== currentUser?.id,
            ),
        [marketplaceSkills, currentUser],
    )

    const receiverOptions = useMemo(() => {
        const owners = new Map()
        marketplaceOfferings.forEach((skill) => {
            if (!owners.has(skill.ownerId)) {
                owners.set(skill.ownerId, { ownerId: skill.ownerId, ownerName: skill.ownerName })
            }
        })
        return Array.from(owners.values()).sort((a, b) => a.ownerName.localeCompare(b.ownerName))
    }, [marketplaceOfferings])

    const requestedSkillOptions = useMemo(() => {
        if (!swapForm.receiverId) {
            return marketplaceOfferings
        }
        return marketplaceOfferings.filter((skill) => skill.ownerId === Number(swapForm.receiverId))
    }, [marketplaceOfferings, swapForm.receiverId])

    const handleCreateSwapRequest = async (event) => {
        event.preventDefault()
        if (!currentUser?.id) {
            notify('error', 'Login required to create swap requests.')
            return
        }

        try {
            const payload = {
                senderId: currentUser.id,
                receiverId: Number(swapForm.receiverId),
                offeredSkillId: Number(swapForm.offeredSkillId),
                requestedSkillId: Number(swapForm.requestedSkillId),
                message: swapForm.message,
            }

            await createSwapRequest(payload)
            setSwapForm(initialSwapForm)
            notify('success', 'Swap request sent successfully.')
            await loadData()
            if (onDataChange) {
                onDataChange()
            }
        } catch (error) {
            notify('error', toApiError(error))
        }
    }

    const handleRequestStatus = async (requestId, status) => {
        if (!currentUser?.id) {
            return
        }

        try {
            await updateSwapRequest(requestId, { actorId: currentUser.id, status })
            notify('success', `Request updated to ${status}.`)
            await loadData()
            if (onDataChange) {
                onDataChange()
            }
        } catch (error) {
            notify('error', toApiError(error))
        }
    }

    if (!currentUser) {
        return (
            <div className="requests-page">
                <motion.section className="auth-required" {...itemAnimation}>
                    <h2>Requests</h2>
                    <p>Please log in to manage your requests.</p>
                </motion.section>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="requests-page">
                <p className="loading-line">Loading requests...</p>
            </div>
        )
    }

    return (
        <div className="requests-page">
            <motion.section className="page-header" {...itemAnimation}>
                <h2>Requests</h2>
                <p>Manage your skill swap requests.</p>
            </motion.section>

            <section className="workspace-grid">
                <motion.article className="panel" {...itemAnimation}>
                    <div className="panel-head">
                        <Handshake size={18} />
                        <h3>Create swap request</h3>
                    </div>
                    <form className="form-grid" onSubmit={handleCreateSwapRequest}>
                        <select
                            value={swapForm.receiverId}
                            onChange={(event) =>
                                setSwapForm((prev) => ({
                                    ...prev,
                                    receiverId: event.target.value,
                                    requestedSkillId: '',
                                }))
                            }
                            required
                        >
                            <option value="">Select peer</option>
                            {receiverOptions.map((user) => (
                                <option value={user.ownerId} key={user.ownerId}>
                                    {user.ownerName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={swapForm.requestedSkillId}
                            onChange={(event) =>
                                setSwapForm((prev) => ({ ...prev, requestedSkillId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Peer skill you want</option>
                            {requestedSkillOptions.map((skill) => (
                                <option value={skill.id} key={skill.id}>
                                    {skill.title} ({skill.category})
                                </option>
                            ))}
                        </select>

                        <select
                            value={swapForm.offeredSkillId}
                            onChange={(event) =>
                                setSwapForm((prev) => ({ ...prev, offeredSkillId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Your offered skill</option>
                            {myOfferingSkills.map((skill) => (
                                <option value={skill.id} key={skill.id}>
                                    {skill.title} ({skill.category})
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder="Message"
                            value={swapForm.message}
                            onChange={(event) => setSwapForm((prev) => ({ ...prev, message: event.target.value }))}
                        />
                        <button className="primary-btn" type="submit">
                            Send request
                        </button>
                    </form>
                </motion.article>
            </section>

            <section className="workspace-grid request-grid">
                <motion.article className="panel" {...itemAnimation}>
                    <div className="panel-head">
                        <Handshake size={18} />
                        <h3>Inbox requests</h3>
                    </div>
                    <div className="stack-list">
                        {inbox.length === 0 ? (
                            <p className="empty-line">No incoming requests.</p>
                        ) : (
                            inbox.map((request) => (
                                <article key={request.id} className="mini-card">
                                    <h4>
                                        {request.senderName} to {request.receiverName}
                                    </h4>
                                    <p>
                                        Wants: {request.requestedSkillTitle} | Offers: {request.offeredSkillTitle}
                                    </p>
                                    <span className={`status-pill ${request.status.toLowerCase()}`}>
                                        {request.status}
                                    </span>
                                    {request.message ? <small>{request.message}</small> : null}
                                    {request.status === 'PENDING' ? (
                                        <div className="action-row">
                                            <button
                                                type="button"
                                                className="success"
                                                onClick={() => handleRequestStatus(request.id, 'ACCEPTED')}
                                            >
                                                <CheckCircle2 size={16} /> Accept
                                            </button>
                                            <button
                                                type="button"
                                                className="danger"
                                                onClick={() => handleRequestStatus(request.id, 'REJECTED')}
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    ) : null}
                                </article>
                            ))
                        )}
                    </div>
                </motion.article>

                <motion.article className="panel" {...itemAnimation}>
                    <div className="panel-head">
                        <Rocket size={18} />
                        <h3>Outbox requests</h3>
                    </div>
                    <div className="stack-list">
                        {outbox.length === 0 ? (
                            <p className="empty-line">No outgoing requests.</p>
                        ) : (
                            outbox.map((request) => (
                                <article key={request.id} className="mini-card">
                                    <h4>To: {request.receiverName}</h4>
                                    <p>
                                        Asking: {request.requestedSkillTitle} | Offering: {request.offeredSkillTitle}
                                    </p>
                                    <span className={`status-pill ${request.status.toLowerCase()}`}>
                                        {request.status}
                                    </span>
                                    {request.message ? <small>{request.message}</small> : null}
                                    {request.status === 'PENDING' ? (
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => handleRequestStatus(request.id, 'CANCELLED')}
                                        >
                                            <Ban size={16} /> Cancel
                                        </button>
                                    ) : null}
                                </article>
                            ))
                        )}
                    </div>
                </motion.article>
            </section>
        </div>
    )
}

export default RequestsPage