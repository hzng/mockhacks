type AvatarProps = {
  name: string
  initials?: string
  size?: 'small' | 'medium' | 'large'
  tone?: 'green' | 'blue' | 'violet' | 'orange'
}

function makeInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

export function Avatar({ initials, name, size = 'medium', tone = 'green' }: AvatarProps) {
  return (
    <span aria-label={name} className={`avatar avatar-${size} avatar-${tone}`} role="img">
      {initials ?? makeInitials(name)}
    </span>
  )
}
