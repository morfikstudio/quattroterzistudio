"use client"

import { useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"

import Link from "@/components/ui/Link"

import "swiper/css"

const PROJECTS = [
  { id: "10", title: "Casa sul Lago" },
  { id: "20", title: "Residenza Borghese" },
  { id: "30", title: "Loft Industriale" },
  { id: "40", title: "Villa Moderna" },
  { id: "50", title: "Appartamento Minimal" },
  { id: "60", title: "Studio Creativo" },
  { id: "70", title: "Penthouse Milano" },
  { id: "80", title: "Cascina Ristrutturata" },
  { id: "90", title: "Atelier Fotografico" },
  { id: "100", title: "Showroom Design" },
  { id: "110", title: "Showroom Design" },
]

const SLIDES_PER_VIEW = 7

export default function ProjectsList() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="projects-list relative h-screen md:grid md:grid-cols-2">
      <style>{`
        .projects-list .swiper-slide .title {
          color: #bcbcbc;
          font-weight: 300;
          font-size: 40px;
          text-align: left;
          transition: color 0.25s ease-out;
        }
        @media (min-width: 800px) {
          .projects-list .swiper-slide .title {
            font-size: 70px;
          }
        }
        .projects-list .swiper-slide-active .title {
          color: #000;
        }
      `}</style>

      {/* Mobile: image centered behind the swiper */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center px-12">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.id}
              className="absolute inset-0"
              style={{ display: activeIndex === i ? "block" : "none" }}
            >
              <Image
                src={`https://picsum.photos/seed/${project.id}/800/600`}
                fill
                alt={project.title}
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: left column with image */}
      <div className="hidden md:flex items-center justify-center h-screen px-12">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.id}
              className="absolute inset-0"
              style={{ display: activeIndex === i ? "block" : "none" }}
            >
              <Image
                src={`https://picsum.photos/seed/${project.id}/800/600`}
                fill
                alt={project.title}
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Swiper: full width on mobile, right column on desktop */}
      <div className="relative h-screen overflow-hidden">
        <Swiper
          modules={[Mousewheel, FreeMode]}
          direction="vertical"
          loop
          centeredSlides
          slidesPerView={SLIDES_PER_VIEW}
          speed={400}
          mousewheel={{ sensitivity: 1, thresholdDelta: 2 }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.8,
            momentumVelocityRatio: 1.5,
          }}
          onActiveIndexChange={(s) => setActiveIndex(s.realIndex)}
          className="h-full w-full"
        >
          {PROJECTS.map((project, i) => (
            <SwiperSlide key={project.id} className="flex items-center">
              <span className="title block px-6 md:px-10 leading-tight">
                case {String(i + 1).padStart(3, "0")}
              </span>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="absolute bottom-20 left-10 z-10">
        <Link href="/projects">Selected</Link>
      </div>
    </div>
  )
}
