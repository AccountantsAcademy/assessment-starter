export const Login = () => {
  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const email = (
            (e.target as HTMLFormElement).querySelector(
              'input[type=email]'
            ) as HTMLInputElement
          ).value
          localStorage.setItem('email', email)
          window.location.href = '/'
        }}
      >
        <input
          type="email"
          required
          placeholder="Email"
          className="border mr-4"
        />
        <button type="submit" className="border p-2">
          Login
        </button>
      </form>
    </div>
  )
}
