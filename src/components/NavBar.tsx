import {useState} from "react";
import {Container, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";

export const NavBar  = () => {
    // Since we're using React Router, the page doesn't refresh on naigation,
    // so the nav menu doesn't get closed by itself. We need to do it manually.

    const [expanded, setExpanded] = useState(false);

    const handleNavItemClick = () => {
        setExpanded(false);
    };

    return <Navbar expand="lg" className="bg-body-tertiary" expanded={expanded}>
        <Container>
            <Navbar.Brand as={Link} to="/">WikiWarrior</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar-nav" onClick={() => { setExpanded(!expanded); }}/>
            <Navbar.Collapse id="navbar-nav">
                <Nav>
                    <Nav.Link as={Link} to="/" onClick={handleNavItemClick}>Home</Nav.Link>
                    <Nav.Link as={Link} to="/about" onClick={handleNavItemClick}>About</Nav.Link>
                    <Nav.Link as={Link} to="/settings" onClick={handleNavItemClick}>Settings</Nav.Link>
                    <Nav.Item as={Link} to="/submit" className="btn btn-outline-primary" onClick={handleNavItemClick}>
                        Submit
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
}