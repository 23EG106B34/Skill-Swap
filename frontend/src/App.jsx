import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ban,
  CheckCircle2,
  Handshake,
  Lightbulb,
  Radar,
  Rocket,
  UserRoundCheck,
  Users,
  XCircle,
} from 'lucide-react'
import {
  createSkill,
  createSwapRequest,
  getDashboard,
  getInboxRequests,
  getMarketplaceSkills,
  getOutboxRequests,
  getSkillsByOwner,
  getUsers,
  loginUser,
  registerUser,
  toApiError,
  updateSwapRequest,
} from './api'
import './App.css'

const metricCards = [
  { key: 'activeUsers', label: 'Active Learners', icon: Users },
  { key: 'activeSkills', label: 'Live Skill Listings', icon: Radar },
  { key: 'incomingPendingRequests', label: 'Incoming Requests', icon: Handshake },
  { key: 'outgoingPendingRequests', label: 'Outgoing Requests', icon: Rocket },
]

const initialRegisterForm = {
  fullName: '',
  email: '',
  password: '',
  department: '',
  yearOfStudy: 1,
  bio: '',
}

const initialLoginForm = {
  email: '',
  password: '',
}

const initialSkillForm = {
  title: '',
  category: '',
  description: '',
  type: 'OFFERING',
  deliveryMode: 'HYBRID',
  weeklyHours: 3,
}

const initialSwapForm = {
  receiverId: '',
  offeredSkillId: '',
  requestedSkillId: '',
  message: '',
}

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

function App() {
  const [users, setUsers] = useState([])
  const [marketplaceSkills, setMarketplaceSkills] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [inbox, setInbox] = useState([])
  const [outbox, setOutbox] = useState([])
  const [dashboard, setDashboard] = useState(emptyDashboard)

  const [currentUser, setCurrentUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [registerForm, setRegisterForm] = useState(initialRegisterForm)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [skillForm, setSkillForm] = useState(initialSkillForm)
  const [swapForm, setSwapForm] = useState(initialSwapForm)

  const [isPublicLoading, setIsPublicLoading] = useState(true)
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false)
  const [flash, setFlash] = useState({ type: '', text: '' })

  const notify = (type, text) => {
    setFlash({ type, text })
  }

  useEffect(() => {
    if (!flash.text) {
      return undefined
    }
    const id = window.setTimeout(() => setFlash({ type: '', text: '' }), 4200)
    return () => window.clearTimeout(id)
  }, [flash])

  const loadPublicData = async () => {
    setIsPublicLoading(true)
    try {
      const [usersData, skillsData] = await Promise.all([getUsers(), getMarketplaceSkills()])
      setUsers(usersData)
      setMarketplaceSkills(skillsData)
    } catch (error) {
      notify('error', toApiError(error))
    } finally {
      setIsPublicLoading(false)
    }
  }

  const loadPrivateData = async (userId) => {
    setIsWorkspaceLoading(true)
    try {
      const [dashboardData, mySkillsData, inboxData, outboxData] = await Promise.all([
        getDashboard(userId),
        getSkillsByOwner(userId),
        getInboxRequests(userId),
        getOutboxRequests(userId),
      ])

      setDashboard({ ...emptyDashboard, ...dashboardData })
      setMySkills(mySkillsData)
      setInbox(inboxData)
      setOutbox(outboxData)
    } catch (error) {
      notify('error', toApiError(error))
    } finally {
      setIsWorkspaceLoading(false)
    }
  }

  useEffect(() => {
    loadPublicData()
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      loadPrivateData(currentUser.id)
      return
    }

    setMySkills([])
    setInbox([])
    setOutbox([])
    setDashboard(emptyDashboard)
    setSwapForm(initialSwapForm)
  }, [currentUser])

  const communityUsers = useMemo(
    () => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [users],
  )

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

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginUser(loginForm)
      setCurrentUser(user)
      setLoginForm(initialLoginForm)
      notify('success', `Logged in as ${user.fullName}.`)
    } catch (error) {
      notify('error', toApiError(error))
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        ...registerForm,
        yearOfStudy: Number(registerForm.yearOfStudy),
      }
      const user = await registerUser(payload)
      setCurrentUser(user)
      setRegisterForm(initialRegisterForm)
      notify('success', 'Profile created. Your collaboration board is ready.')
      await loadPublicData()
    } catch (error) {
      notify('error', toApiError(error))
    }
  }

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
      await Promise.all([loadPublicData(), loadPrivateData(currentUser.id)])
    } catch (error) {
      notify('error', toApiError(error))
    }
  }

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
      await loadPrivateData(currentUser.id)
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
      await loadPrivateData(currentUser.id)
    } catch (error) {
      notify('error', toApiError(error))
    }
  }

  const pendingInbox = inbox.filter((item) => item.status === 'PENDING')

  return (
    <div className="app-shell">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-grid" />

      <main className="content-wrap">
        <motion.header className="hero" {...itemAnimation}>
          <p className="hero-kicker">Peer Learning Platform</p>
          <h1>SkillSwap Nexus</h1>
          <p className="hero-subtitle">
            A structured collaboration network where members exchange real-world expertise through
            verified, skill-for-skill sessions.
          </p>

          <div className="hero-toolbar">
            {currentUser ? (
              <p className="signed-in">
                Signed in as <strong>{currentUser.fullName}</strong>
              </p>
            ) : (
              <p className="signed-in">Sign in or create an account to start exchanging skills.</p>
            )}
            {currentUser ? (
              <button className="ghost-btn" type="button" onClick={() => setCurrentUser(null)}>
                Logout
              </button>
            ) : null}
          </div>
        </motion.header>

        {flash.text ? <div className={`flash ${flash.type}`}>{flash.text}</div> : null}

        {isPublicLoading ? <p className="loading-line">Loading community board...</p> : null}

        {!currentUser ? (
          <motion.section className="auth-card" {...itemAnimation}>
            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            {authMode === 'login' ? (
              <form className="form-grid" onSubmit={handleLogin}>
                <h2>Access your workspace</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <button type="submit" className="primary-btn">
                  Login
                </button>
              </form>
            ) : (
              <form className="form-grid" onSubmit={handleRegister}>
                <h2>Create your profile</h2>
                <input
                  type="text"
                  placeholder="Full name"
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={registerForm.department}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  required
                />
                <input
                  type="number"
                  min="1"
                  max="8"
                  placeholder="Year of study"
                  value={registerForm.yearOfStudy}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, yearOfStudy: event.target.value }))
                  }
                  required
                />
                <textarea
                  placeholder="Short bio"
                  value={registerForm.bio}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, bio: event.target.value }))}
                />
                <button type="submit" className="primary-btn">
                  Register
                </button>
              </form>
            )}
          </motion.section>
        ) : (
          <>
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
                        <span>{skill.type}</span>
                      </article>
                    ))
                  )}
                </div>
              </motion.article>

              <motion.article className="panel" {...itemAnimation}>
                <div className="panel-head">
                  <Radar size={18} />
                  <h3>Smart recommendations</h3>
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
                        <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
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
                        <h4>
                          To: {request.receiverName}
                        </h4>
                        <p>
                          Asking: {request.requestedSkillTitle} | Offering: {request.offeredSkillTitle}
                        </p>
                        <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
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

            <motion.section className="community-strip" {...itemAnimation}>
              <h3>Community pulse</h3>
              <div className="community-list">
                {communityUsers.map((user) => (
                  <article key={user.id} className="community-user">
                    <strong>{user.fullName}</strong>
                    <p>{user.department}</p>
                    <small>Year {user.yearOfStudy}</small>
                  </article>
                ))}
              </div>
              {pendingInbox.length > 0 ? (
                <p className="attention-note">
                  You currently have {pendingInbox.length} pending request
                  {pendingInbox.length > 1 ? 's' : ''} waiting.
                </p>
              ) : null}
            </motion.section>
          </>
        )}

        {isWorkspaceLoading ? <p className="loading-line">Refreshing workspace...</p> : null}
      </main>
    </div>
  )
}

export default App
