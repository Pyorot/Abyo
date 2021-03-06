var channels = {
    info: "354340872067874826",
    general: "354340787133349902",
    100: "354340998719209472",
    A: "354341032671838208",
    B: "354341059771498506",
    C: "354341081938395149",
    D: "354341128876851222",
    E: "354341168051388417",
    F: "354341182379261954",
    G: "354341199152152587",
    H: "354341215505874945",
    I: "354341230727004170",
    J: "354341249055981570",
    K: "354341266621857793",
    L: "354341282774122507",
    M: "354341303028416536",
    N: "354341318149013504",
    O: "354341336352030731",
    P: "354341350914654228",
    Q: "354341365343191050",
    R: "354341378676752385",
    S: "354341392916414465",
    T: "354341405721755651",
    U: "354341419755765761",
    V: "354341434188627968",
    W: "354341448482684940",
    X: "354341461828960267",
    Y: "354341476555292682",
    Z: "354341491801587722",
    unknown: "354341517579517962"
}

function filter(pokemon) {
    if (pokemon.name == "Unown") {
        let letter = pokemon.letter ? pokemon.letter : "unknown"
        if (pokemon.ivPercent == 100) {
            return ["100", letter]
        } else {
            return letter
        }
    }
}

module.exports.channels = channels
module.exports.filter = filter