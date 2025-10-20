import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
  })

  it('renders navigation tabs', () => {
    render(<App />)
    expect(screen.getByText('Focus Journal')).toBeInTheDocument()
    expect(screen.getByText('AI Summarizer')).toBeInTheDocument()
    expect(screen.getByText('Focus Timer')).toBeInTheDocument()
    expect(screen.getByText('Daily Prompts')).toBeInTheDocument()
    expect(screen.getByText('Translator')).toBeInTheDocument()
  })
})