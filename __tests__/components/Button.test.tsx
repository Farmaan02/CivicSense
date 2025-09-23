import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with correct text', () => {
    const { getByText } = render(<Button>Click me</Button>)
    expect(getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn()
    const { getByText } = render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(<Button disabled>Click me</Button>)
    expect(getByText('Click me')).toBeDisabled()
  })

  it('should show loading state when loading prop is true', () => {
    const { getByRole } = render(<Button loading>Loading</Button>)
    const button = getByRole('button')
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('should apply variant classes correctly', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>)
    const button = getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('should apply size classes correctly', () => {
    const { getByRole } = render(<Button size="lg">Large Button</Button>)
    const button = getByRole('button')
    expect(button).toHaveClass('h-12')
  })
})