'use client'

export default function ConfirmButton({ message, children, ...props }) {
  return (
    <button
      {...props}
      formNoValidate
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
