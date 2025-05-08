export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <p>This is a simplified profile page.</p>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" defaultValue="John Doe" />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" defaultValue="john@example.com" />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  )
}
