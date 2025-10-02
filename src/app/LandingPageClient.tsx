'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import LoginModal from '../components/LoginModal'

interface ModalContextType {
    isOpen: boolean
    openModal: () => void
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
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

    const openModal = () => {
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
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeModal}
            />
        </ModalContext.Provider>
    )
}

// Component for buttons that should open the modal
interface ModalButtonProps {
    children: ReactNode
    className?: string
}

export function ModalButton({ children, className }: ModalButtonProps) {
    const { openModal } = useModal()

    return (
        <button onClick={openModal} className={className}>
            {children}
        </button>
    )
}