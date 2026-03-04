import Link from "next/link"

import Title from "@/components/ui/Title"

export default function Page() {
  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>About</Title>
      <hr />
      <Link href="/" className="text-pink-600 hover:underline">
        &larr; Return home
      </Link>
    </main>
  )
}
