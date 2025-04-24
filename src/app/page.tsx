import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0">
        <Image
          src="/heroImage.jpg"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center text-white">
          <h1 className="mb-4 text-4xl font-bold">Welcome to Jewelry by LUNA</h1>
          <p className="text-xl">Discover our exquisite collection</p>
        </div>
      </div>
    </main>
  );
} 