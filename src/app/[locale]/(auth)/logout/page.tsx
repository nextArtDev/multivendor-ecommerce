import { auth, signOut } from '../../../../../auth'

async function page() {
  const session = await auth()
  return (
    <div>
      <form
        action={async () => {
          'use server'
          await signOut()
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  )
}

export default page
