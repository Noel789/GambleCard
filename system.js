// --------------------------------------- setup --------------------------------------- //
var cards_container = document.getElementById("cards_container")
var body = document.getElementsByTagName("body")[0]
var coin_value = document.getElementById("coin_value")
var coin = document.getElementById("coin")
var reset_screen = document.getElementById("reset_screen")
var difficulties_tab = document.getElementById("difficulties_tab")

// set up svg string
var card_svg = {}
fetch("./svg/card_back.svg").then(response => response.text()).then(text => {card_svg["back"] = text})
fetch("./svg/card_coin.svg").then(response => response.text()).then(text => {card_svg["coin"] = text})
fetch("./svg/card_death.svg").then(response => response.text()).then(text => {card_svg["death"] = text})

var card_animation_timer = 150
var card_amount = 8
var picked_card
var is_won = false
var coin_change = true
var won_range = card_amount -1
var difficulties = "easy"

// set up sound
var sound = {}
sound['flip'] = document.getElementById("sound_flip")
sound['hover'] = document.getElementById("sound_hover")
sound['click'] = document.getElementById("sound_click")
sound['swing'] = document.getElementById("sound_swing")
sound['win'] = document.getElementById("sound_win")


// --------------------------------------- card function --------------------------------------- //
function create_card(type){
    
    let card = document.createElement("svg")
    let card_back = document.createElement("svg")
    let card_main = document.createElement("svg")

    card.appendChild(card_back)
    card.appendChild(card_main)

    // setup card
    new Promise(() =>{

        card.style.transform = 'scale(0,1)'
        
        setTimeout(()=>{
            card_back.innerHTML = card_svg.back
            card_main.innerHTML = card_svg[type]

            card.style.transform = 'scale(1,1)'

        }, card_animation_timer)
    })

    card.setAttribute("id", `card_${type}`); card.setAttribute("class", "card back")

    card.style.width = "166px"; card.style.height = "222px"
    card_back.style.position = "absolute"
    card_main.style.position = "absolute"; card_main.style.display = "none"

    card.setAttribute("onclick", "if(!is_won) flip(this);")
    card.setAttribute("onmouseenter", "if(!is_won) play(sound.hover)")
    
    return card
}

function set_card(amount){
    
    // reseting amount and card win change
    coin_change = true
    card_amount = amount
    won_range = card_amount -1
    is_won = false

    cards_container.innerHTML = ''

    // set up how many card
    won_range = card_amount
    for (let i = 0; i < amount; i++) {

        let type = card_shuffle()
        cards_container.appendChild(create_card(type))
    }

    // column will be 2 or more determine by screen ratio
    if(amount > 4 && document.documentElement.clientWidth > document.documentElement.clientHeight)    cards_container.style.gridTemplateColumns = `repeat(${amount/2}, 1fr)`
    else    cards_container.style.gridTemplateColumns = 'repeat(2, 1fr)'
}

function flip (card, revealing = false){

    // playing audio
    if(!revealing) play(sound.flip)

    // return suposed card
    let type = card.id.replace("card_", "")
    
    // revealing every card when win
    if(!revealing && type == "coin"){
        for(let i = 0; i< cards_container.children.length && !revealing; i++){
            let target = cards_container.children[i]
            if(target != card && target.classList[1] == "back" && !is_won) flip(target, true)
        } 
    }

    if(card.classList[1] != "back") type = "back" 

    // promise for flip animation and change card
    new Promise(() => {
        // do
        card.style.transform = 'scale(0,1)'
        
        // then
        setTimeout(() => {
            
            switch (type) {
                case "back":
                    //card.innerHTML = card_svg.back
                    card.classList.replace("coin", "back")
                    card.classList.replace("death", "back")
                    //card.setAttribute("id", "card_back")

                    card.children[0].style.display = "block"
                    card.children[1].style.display = "none"
                break;
            
                case "coin":
                    //card.innerHTML = card_svg.coin
                    card.classList.replace("back", "coin")
                    card.classList.replace("death", "coin")
                    //card.setAttribute("id", "card_coin")

                    card.children[1].style.display = "block"
                    card.children[0].style.display = "none"
                break;
            
                case "death":
                    //card.innerHTML = card_svg.death
                    card.classList.replace("back", "death")
                    card.classList.replace("coin", "death")
                    //card.setAttribute("id", "card_death")

                    card.children[1].style.display = "block"
                    card.children[0].style.display = "none"
                break;
            
                default:
                    console.log("misspell")
                break;
            }

            card.style.transform = 'scale(1,1)'

            // set picked_card and diterment if lose or win
            if(!revealing){
                picked_card = card
            
                if(type == "coin" && !is_won) win(card)
                if(type == "death" && !is_won) lose(card)
            }

        }, card_animation_timer)
    })
}

function card_shuffle(){
    
    let random_won = Math.floor(Math.random() * (won_range))

    if(random_won == 0 && coin_change){

        // if win
        coin_change = false
        return "coin"
    } else{
        
        // if lose
        won_range -= 1
        return "death"  
    }
}

function win (card){
    coin_value.innerHTML = (coin_value.innerHTML == "0")? card_amount : Math.floor(parseInt(coin_value.innerHTML)*card_amount)
    new Promise(() => {
        coin.style = ' filter: brightness(5); text-shadow: 0px 0px 1vmin rgba(255, 169, 63, 1), 0px 0px 2vmin rgba(229, 95, 60, 1); '
        setTimeout(() =>{
            coin.style = ''
        }, 1500)
    })

    play(sound.win)
    is_won = true
    card.classList.add("won")
    body.classList.add("won")
}

function lose (card){
    coin_value.innerHTML = Math.floor(parseInt(coin_value.innerHTML)/2)
}

// --------------------------------------- start reset and difficulties --------------------------------------- //
function reset(){

    if(is_won || cards_container.children.length == 0) {
        
        is_won = false
        body.classList.remove("won")
        
        let cards = document.getElementsByClassName("card")
        for(let i = 0; i < cards.length; i++){
            cards[i].style.transform = 'scale(0,1)'
        }
    
        new Promise(()=>{
        
            setTimeout(()=>{
            
                    switch(difficulties){
                    
                        case "easy":
                            set_card(2)
                        break
                    
                            case "medium":
                            set_card(4)
                        break
                    
                            case "hard":
                            set_card(8)
                        break
                    }
                
            }, card_animation_timer)
        })

    }
}

function selecting_difficulties(selecting_difficulties){

    difficulties = selecting_difficulties
    is_won = true
    reset()

    for(let i = 0; i<difficulties_tab.childElementCount; i++){
        let element = difficulties_tab.children[i]
        element.classList.remove("selected")
    }

    let difficulties_element = document.getElementById(selecting_difficulties)
    difficulties_element.classList.add("selected")
}


// dynamic resize
let screen_ratio = Math.sqrt(document.documentElement.clientWidth**2 + document.documentElement.clientHeight**2)

cards_container.style.transform = `translate(-50%, -50%) scale( ${screen_ratio/2000}) perspective(1000px)`


// --------------------------------------- audio --------------------------------------- //
function play(path) {
    
    let audio  = new Audio();
    
    audio.appendChild(path);
    audio.play()
    audio.remove()     
}


// --------------------------------------- preload --------------------------------------- //
function preload_audio(){
    Object.keys(sound).forEach(key => {
        let path = sound[key]

        const audio = new Audio()
        audio.appendChild(path)
        audio.preload = "auto"

        audio.play()
        audio.muted = true
        audio.remove()
    })
}

new Promise(resolve => {
    preload_audio()
    reset()
})