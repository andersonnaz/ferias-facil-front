interface NavItemProps {
  title?: string;
  to: string;
}

export function NavItem ({title, to}: NavItemProps) {
    return(
        <a href={to} >
            <span className="text-[#217346] font-semibold">
                {title}
            </span>
        </a>
    )
}