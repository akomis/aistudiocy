type Social = {
  key: string
  value: string
  url?: string
}

type Props = {
  socials: Social[]
  message?: string
  instagramOnly?: boolean
}

export default function Contact({ socials, message, instagramOnly }: Props) {
  const instagram = socials.find(
    (social) => social.key.toLowerCase() === "instagram"
  )
  const email = socials.find((social) => social.key.toLowerCase() === "email")

  const filteredSocials = instagramOnly
    ? [instagram].filter(Boolean) as Social[]
    : [instagram, email].filter(Boolean) as Social[]

  return (
    <div className="flex flex-col items-center gap-8">
      {message && (
        <p className="text-lg md:text-2xl text-center font-light max-w-2xl">
          {message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row font-bold gap-10">
        {filteredSocials.map((social) => (
          <div key={social.key} className="flex flex-col text-start">
            <p>{social.key}</p>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-all duration-500"
            >
              {social.value}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
