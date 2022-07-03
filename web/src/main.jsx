import React, { useState, useEffect } from "react";

import { Stack, Paper, Box, Button } from '@mui/material';

const URL = 'ws://127.0.0.1:8000';

const Main = () => {
    const [userLastRunToWheel, setUserLastRunToWheel] = useState(0)
    const [userName, setUserName] = useState('Sin datos');
    const [balance, setBalance] = useState(0)
    const [prizesSets, setPrizesSets] = useState([])
    const [lastPrize, setLastPrize] = useState("")
    const [ws, setWs] = useState(new WebSocket(URL));

    const getUsersData = () => {
        const request = { operation: "getUserData", userId: "someId" }
        ws.send(JSON.stringify(request));
    }
    const getPrizeForConection = () => {
        const now = Date.now()
        const diff = Math.abs(Date.now() - userLastRunToWheel);
        const minutes = Math.floor((diff / 1000) / 60)
        const request = { operation: "getPrizeForConection", lastRunToWheel: now, newBalance: (balance + 1) }
        if (minutes >= 1) {
            ws.send(JSON.stringify(request));
            setUserLastRunToWheel(now)
        }
    }
    const loadPrizesCharts = () => {
        const request = { operation: "loadPrizes" }
        ws.send(JSON.stringify(request));
    }
    const rollPrizes = (dataToRoll) => {
        const arrRolls = []
        const newBalance = balance - parseInt(dataToRoll.cost)
        if (balance > 0) {
            const request = {operation:"rollPrizes", bal: newBalance}
            ws.send(JSON.stringify(request));
            dataToRoll.details.forEach(eachDetail => {
                const transformedProb = eachDetail.probability * 10
                for (let i = 0; i < transformedProb; i++) {
                    arrRolls.push(eachDetail.name)
                }
            })
            const rand = Math.floor(Math.random() * 10);
            setLastPrize(arrRolls[rand])
        } else {
            setLastPrize("")
        }


    }
    useEffect(() => {
        ws.onopen = () => {
            console.log('WebSocket Connected');
        }
        ws.onmessage = (e) => {
            const response = JSON.parse(e.data);
            switch (response.operation) {
                case "getUserData":
                    setUserName(response.dataUser.name)
                    setBalance(response.dataUser.balance)
                    setUserLastRunToWheel(response.dataUser.lastRuntoWheel)
                    break;

                case "getPrizeForConection":
                    const addedBalance = balance + 1
                    setBalance(addedBalance)
                    break;

                case "loadPrizes":
                    setPrizesSets(response.dataPrizes['prize-sets'])
                    break;
                case "rollPrizes":
                    setBalance(response.dataUser.balance)
                    break;
                default:
                    console.error("Unidentify operation")
                    break;

            }
        }

        return () => {
            ws.onclose = () => {
                console.log('WebSocket Disconnected');
                setWs(new WebSocket(URL));
            }
        }

    }, [ws.onmessage, ws.onopen, ws.send, ws.onclose, ws, balance]);


    return (
        <div>
            <div>Hola {userName}</div>
            <div>Tienes un balance de <b>{balance}</b> creditos</div>
            <Button onClick={() => getUsersData()}> Cargar datos de usuario </Button>
            <Button onClick={() => getPrizeForConection()}>Recibir premio de conexion</Button>
            <Button onClick={() => loadPrizesCharts()}>Canjear creditos</Button>
            {prizesSets.length > 0 ?
                <div>
                    <Stack sx={{ marginTop: "3%" }} direction="row" spacing={2} justifyContent="center">
                        {prizesSets.map((eachSet, index) => (
                            <Paper key={"key-" + eachSet.name} >
                                Costos por giro: {eachSet.cost} credito(s)
                                <Stack sx={{ margin: "5% 0 5% 0" }}>
                                    {eachSet.details.map((eachDetail) => (
                                        <Box key={"key-" + eachDetail.name}>
                                            <Stack direction="row" spacing={5} justifyContent="space-between">
                                                <div>{eachDetail.name}</div>
                                                <div>{eachDetail.probability * 100}%</div>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                                <Button onClick={() => rollPrizes(eachSet)}>Girar</Button>
                            </Paper>
                        ))}
                    </Stack>

                </div> :
                <></>}
            {lastPrize !== "" ?
                <>Ganaste {lastPrize} !</> :
                <></>}
        </div>
    )
}

export default Main;