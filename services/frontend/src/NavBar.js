// https://mui.com/material-ui/react-app-bar/
// https://stackoverflow.com/questions/11419998/text-decoration-none-not-working
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Link to={"/"} style={{ textDecoration: "none", color: "white" }}>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{ flexGrow: 1, fontWeight: "bold", fontSize: "30px" }}
                        >
                            CryptoBoard
                        </Typography>
                    </Link>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
