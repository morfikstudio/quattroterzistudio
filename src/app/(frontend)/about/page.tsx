import Link from "next/link"

import { Title } from "@/components/title"

export default function Page() {
  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>About</Title>
      <p className="max-w-xl text-slate-600">
        Quattro Terzi Studio.
      </p>
      <hr />
      <Link href="/" className="text-pink-600 hover:underline">
        &larr; Return home
      </Link>
    </main>
  )
}
