import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('should render with correct placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    )
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should render with label when provided', () => {
    const { getByText } = render(
      <Input label="Email Address" />
    )
    expect(getByText('Email Address')).toBeInTheDocument()
  })

  it('should call onChange when value changes', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <Input onChange={handleChange} />
    )
    
    const input = getByRole('textbox')
    await userEvent.type(input, 'test value')
    expect(handleChange).toHaveBeenCalledTimes(10) // 10 characters typed
  })

  it('should display error message when error prop is provided', () => {
    const { getByText } = render(
      <Input error="This field is required" />
    )
    expect(getByText('This field is required')).toBeInTheDocument()
  })

  it('should apply error variant classes when error is present', () => {
    const { getByRole } = render(
      <Input error="Invalid input" />
    )
    const input = getByRole('textbox')
    expect(input).toHaveClass('border-destructive')
  })

  it('should apply size classes correctly', () => {
    const { getByRole } = render(
      <Input inputSize="lg" />
    )
    const input = getByRole('textbox')
    expect(input).toHaveClass('h-12')
  })
})