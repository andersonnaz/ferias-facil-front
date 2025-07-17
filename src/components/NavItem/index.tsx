interface NavItemProps {
  title?: string;
  to: string;
}

export function NavItem ({title, to}: NavItemProps) {
    return(
        <a href={to} >
            <span className="text-[#333333]">
                {title}
            </span>
        </a>
    )
}