
import { useState, useEffect } from "react";

const Box = ({ children, color }) => (
  <div style={{
    border: "2px solid black",
    padding: "10px",
    borderRadius: "10px",
    background: color || "white",
    minHeight: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }}>
    {children}
  </div>
);

const Button = (props) => (
  <button style={{ padding: "8px", margin: "5px", cursor: "pointer" }} {...props} />
);

export default function App() {
  const [showList, setShowList] = useState(false);
  const [players, setPlayers] = useState([]); // jugadores activos del día
  const [savedPlayers, setSavedPlayers] = useState([]); // lista general
  const [waiting, setWaiting] = useState([]);
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });
  const [name, setName] = useState("");
  const [streak, setStreak] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("players");
    if (data) setSavedPlayers(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(savedPlayers));
  }, [savedPlayers]);

  const buildTeams = (list) => {
    if (list.length < 4) return { teamA: [], teamB: [] };
    return {
      teamA: [list[0], list[1]],
      teamB: [list[2], list[3]],
      rest: list.slice(4),
    };
  };

  const organize = (allPlayers) => {
    if (allPlayers.length >= 4) {
      const { teamA, teamB, rest } = buildTeams(allPlayers);
      setCourts({ teamA, teamB });
      setWaiting(rest);
    } else {
      setCourts({ teamA: [], teamB: [] });
      setWaiting(allPlayers);
    }
  };

  // ✅ AGREGAR a lista general
  const addToList = () => {
    if (!name) return;
    if (!savedPlayers.includes(name)) {
      setSavedPlayers([...savedPlayers, name]);
    }
    setName("");
  };


  // ✅ seleccionar jugador para el día
  const selectPlayer = (p) => {
    if (players.includes(p)) return;
    const updated = [...players, p];
    setPlayers(updated);
    organize(updated);
  };

  // ✅ quitar del día
  const removePlayer = (p) => {
    const updated = players.filter(x => x !== p);
    setPlayers(updated);
    organize(updated);
  };

  // ✅ eliminar de lista general
  const removeSavedPlayer = (p) => {
    const updated = savedPlayers.filter(x => x !== p);
    setSavedPlayers(updated);


    // también quitar del día si está
    removePlayer(p);
  };

  const resetScore = () => {
    setScoreA(0);
    setScoreB(0);
  };

  const winner = (side) => {
    const { teamA, teamB } = courts;
    if (teamA.length < 2 || teamB.length < 2) return;

    const winnerTeam = side === "A" ? teamA : teamB;
    const loserTeam = side === "A" ? teamB : teamA;


    let newWaiting = [...waiting, ...loserTeam];
    const newStreak = streak + 1;

    resetScore();

    if (newWaiting.length >= 4) {
      if (newStreak < 2) {
        const challengers = newWaiting.slice(0, 2);
        setCourts({ teamA: winnerTeam, teamB: challengers });
        setWaiting(newWaiting.slice(2));
        setStreak(newStreak);
      } else {
        const nextTeam = newWaiting.slice(0, 2);
        const nextRival = newWaiting.slice(2, 4);
        const rest = newWaiting.slice(4);
        setCourts({ teamA: nextTeam, teamB: nextRival });
        setWaiting([...rest, ...winnerTeam]);
        setStreak(0);
      }
    } else if (newWaiting.length === 3) {
      organize([...winnerTeam, ...newWaiting]);
      setStreak(0);
    } else if (newWaiting.length >= 2) {
      const challengers = newWaiting.slice(0, 2);
      setCourts({ teamA: winnerTeam, teamB: challengers });
      setWaiting(newWaiting.slice(2));
      setStreak(newStreak);
    } else {
      setWaiting(newWaiting);
      setStreak(newStreak);
    }
  };

  return (
    <div style={{ padding: 15 }}>
      <h2>🎾 Reta Frontón</h2>

      {/* ✅ LISTA GENERAL */}
      <div>
        <h3 style={{ cursor: "pointer" }} onClick={() => setShowList(!showList)}>
          📋 Lista de jugadores {showList ? "▲" : "▼"}
        </h3>
        {showList && (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nuevo jugador" />
            <Button onClick={addToList}>Agregar a lista</Button>
            <div>
              {savedPlayers.map((p, i) => (
                <div key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                  <Button onClick={() => selectPlayer(p)}>{p}</Button>
                  <button onClick={() => removeSavedPlayer(p)}>❌</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* ✅ JUGADORES DEL DÍA */}
      <div style={{ marginTop: 20 }}>
        <h3>🎯 Juego actual</h3>
        {players.map((p, i) => (
          <div key={i}>{p} <button onClick={() => removePlayer(p)}>❌</button></div>
        ))}
      </div>

      {/* CANCHA */}
      <div style={{ marginTop: 20 }}>
        <h3>En juego</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

          <Box color="#3b82f6">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <strong style={{ color: "white" }}>Equipo A</strong>
              <button onClick={() => setScoreA(0)} style={{ cursor: "pointer" }}>🔄</button>
            </div>
            {courts.teamA.map((p, i) => <div key={i} style={{ color: "white" }}>{p}</div>)}
            <div style={{ color: "white" }}>A: {scoreA}</div>
            <Button onClick={() => setScoreA(scoreA + 1)}>+ Punto</Button>
            <Button disabled={scoreA <= scoreB} onClick={() => winner("A")}>
              Gana
            </Button>
          </Box>

          <Box color="#ef4444">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <strong style={{ color: "white" }}>Equipo B</strong>
              <button onClick={() => setScoreB(0)} style={{ cursor: "pointer" }}>🔄</button>
            </div>
            {courts.teamB.map((p, i) => <div key={i} style={{ color: "white" }}>{p}</div>)}
            <div style={{ color: "white" }}>B: {scoreB}</div>
            <Button onClick={() => setScoreB(scoreB + 1)}>+ Punto</Button>
            <Button
  disabled={scoreB <= scoreA}
  onClick={() => winner("B")}
>
  Gana
</Button>
          </Box>

        </div>
      </div>

      {/* Fila */}
      <div style={{ marginTop: 20 }}>
        <h3>Fila</h3>
        {waiting.map((p, i) => <div key={i}>{p}</div>)}
      </div>
    </div>
  );
}
