'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import LoginModal from '../components/LoginModal'
import LandingEntryModal from '../components/LandingEntryModal'

interface ModalContextType {
    isOpen: boolean
    openModal: (mode?: 'login' | 'signup') => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}

interface ModalProviderProps {
    children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(true)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [initialMode, setInitialMode] = useState<'login' | 'signup'>('login')

    const openModal = (mode: 'login' | 'signup' = 'login') => {
        setInitialMode(mode)
        setIsLoginModalOpen(true)
    }

    const closeModal = () => {
        setIsLoginModalOpen(false)
    }

    const contextValue = {
        isOpen: isLoginModalOpen,
        openModal,
        closeModal
    }


    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <LandingEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
            />
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeModal}
                initialMode={initialMode}
            />
        </ModalContext.Provider>
    )
}

// Component for buttons that should open the modal
interface ModalButtonProps {
    children: ReactNode
    className?: string
    mode?: 'login' | 'signup'
}

export function ModalButton({ children, className, mode = 'login' }: ModalButtonProps) {
    const { openModal } = useModal()

    return (
        <button onClick={() => openModal(mode)} className={className}>
            {children}
        </button>
    )
}