import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, toApiError } from '../api'

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

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

function AuthPage({ onLogin, notify }) {
    const [authMode, setAuthMode] = useState('login')
    const [registerForm, setRegisterForm] = useState(initialRegisterForm)
    const [loginForm, setLoginForm] = useState(initialLoginForm)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            const user = await loginUser(loginForm)
            onLogin(user)
            setLoginForm(initialLoginForm)
            notify('success', `Logged in as ${user.fullName}.`)
            navigate('/dashboard')
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            const payload = {
                ...registerForm,
                yearOfStudy: Number(registerForm.yearOfStudy),
            }
            const user = await registerUser(payload)
            onLogin(user)
            setRegisterForm(initialRegisterForm)
            notify('success', 'Profile created. Your collaboration board is ready.')
            navigate('/dashboard')
        } catch (error) {
            notify('error', toApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page">
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
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
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
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Creating profile...' : 'Register'}
                        </button>
                    </form>
                )}
            </motion.section>
        </div>
    )
}

export default AuthPage