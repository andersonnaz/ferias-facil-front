import { NavItem } from "../NavItem"

export function NavBar () {
    return(
        <nav className="flex gap-10 ml-8">
            <NavItem title="Tutorial" to="#tutorial" />
            <NavItem title="Contato" to="#contato" />
        </nav>
    )
}