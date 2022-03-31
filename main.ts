namespace SpriteKind {
    export const cloud = SpriteKind.create()
    export const human = SpriteKind.create()
    export const friend = SpriteKind.create()
    export const call = SpriteKind.create()
    export const castle = SpriteKind.create()
    export const booster = SpriteKind.create()
}

class ActionKind {
    static Flying = 0
    static Roaring = 1
    static Buddy_Fly = 2
    static Babe_Fly = 3
}

// ======VARIABLES======
let speed = 40
let bg_speed = -30
let enemy_interval = 3000
let kill_count = 0
let recruits = 0
let fire : Sprite = null
let buddy : Sprite = null
let babe : Sprite = null
let castle : Sprite = null
let circle : Sprite = null
let friend_img = [assets.image`buddy`, assets.image`buddy1`, assets.image`babe`, assets.image`babe1`]
// ======DRAGONS======
// player set-up
let dragon = sprites.create(assets.image`dragon`, SpriteKind.Player)
dragon.setFlag(SpriteFlag.StayInScreen, true)
dragon.setPosition(30, 60)
dragon.z = 2
// create buddy off-screen
buddy = sprites.create(friend_img[0], SpriteKind.friend)
buddy.setPosition(randint(200, 300), randint(40, 80))
buddy.z = 2
// create babe off-screen
babe = sprites.create(friend_img[2], SpriteKind.friend)
babe.setPosition(randint(200, 300), randint(40, 80))
babe.z = 2
// creat castle off-screen
castle = sprites.create(assets.image`end`, SpriteKind.castle)
castle.x = 250
castle.z = 1
// flying - player
let fly = animation.createAnimation(ActionKind.Flying, 500)
fly.addAnimationFrame(assets.image`dragon1`)
fly.addAnimationFrame(assets.image`dragon`)
animation.attachAnimation(dragon, fly)
animation.setAction(dragon, 0)
// flying - buddy
let buddy_fly = animation.createAnimation(2, 500)
buddy_fly.addAnimationFrame(friend_img[1])
buddy_fly.addAnimationFrame(friend_img[0])
animation.attachAnimation(buddy, buddy_fly)
animation.setAction(buddy, 2)
// flying - babe
let babe_fly = animation.createAnimation(3, 500)
babe_fly.addAnimationFrame(friend_img[3])
babe_fly.addAnimationFrame(friend_img[2])
animation.attachAnimation(babe, babe_fly)
animation.setAction(babe, 3)
// ======PLAYER MECHANICS======
// player move
game.onUpdate(function move() {
    if (controller.up.isPressed()) {
        dragon.vy = -speed
    } else if (controller.down.isPressed()) {
        dragon.vy = speed
    } else {
        dragon.vy = 0
    }
    
})
// friend call
controller.B.onEvent(ControllerButtonEvent.Pressed, function friend_req() {
    let call = sprites.createProjectileFromSprite(assets.image`call`, dragon, 50, 0)
    call.x = 55
    call.setKind(SpriteKind.call)
})
// shoot flames
// dragon.say_text("ROAR!", 400)
controller.A.onEvent(ControllerButtonEvent.Pressed, function dragon_fire() {
    
    fire = sprites.createProjectileFromSprite(assets.image`fire`, dragon, 50, 0)
    fire.x = 55
    fire.setFlag(SpriteFlag.DestroyOnWall, true)
})
// roaring
let roar = animation.createAnimation(ActionKind.Roaring, 500)
roar.addAnimationFrame(assets.image`dragon_attack`)
animation.attachAnimation(dragon, roar)
// roar when shoot fire
// def to_roar():
//     if fire != None and fire.x < 70:
//         animation.set_action(dragon, 1)
//     else:
//         animation.set_action(dragon, 0)
// game.on_update(to_roar)
// ======CLOUDS======
// cloud spawn
game.onUpdateInterval(2000, function generate_cloud() {
    let cloud: Sprite;
    let cloud_pick = randint(0, 2)
    if (cloud_pick == 0) {
        cloud = sprites.createProjectileFromSide(assets.image`cloud0`, bg_speed, 0)
    } else if (cloud_pick == 1) {
        cloud = sprites.createProjectileFromSide(assets.image`cloud1`, bg_speed, 0)
    } else if (cloud_pick == 2) {
        cloud = sprites.createProjectileFromSide(assets.image`cloud2`, bg_speed, 0)
    }
    
    cloud.y = randint(0, 121)
    cloud.z = 0
    cloud.setKind(SpriteKind.cloud)
})
// ======COLLECTIBLES======
// collectible spawn
game.onUpdateInterval(2000, function circle_spawn() {
    
    if (Math.percentChance(40)) {
        circle = sprites.createProjectileFromSide(assets.image`boost`, bg_speed, 0)
        circle.y = randint(0, 121)
        circle.z = 0
        circle.setKind(SpriteKind.booster)
    }
    
})
// actually collectible
sprites.onOverlap(SpriteKind.booster, SpriteKind.Player, function collecting(circle: Sprite, dragon: Sprite) {
    
    circle.destroy()
    dragon.sayText("Delicious.", 400)
    bg_speed = bg_speed - 10
    enemy_interval = enemy_interval - 500
    speed = speed + 2
})
// ======ENEMIES======
// enemy spawn
game.onUpdateInterval(enemy_interval, function generate_enemy() {
    let balloon: Sprite;
    if (Math.percentChance(60)) {
        balloon = sprites.createProjectileFromSide(assets.image`balloon`, bg_speed + 20, 0)
        balloon.y = randint(20, 100)
        balloon.z = 1
        balloon.setKind(SpriteKind.human)
    }
    
})
// destroy balloon + make friends + spawn the end
let dying = ["ARGH!"]
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.human, function destroy_balloon(fire: Sprite, human: Sprite) {
    
    human.sayText(dying[randint(0, dying.length - 1)])
    human.destroy(effects.disintegrate, 200)
    fire.destroy()
    kill_count += 1
    if (kill_count >= 5 && recruits == 0) {
        // buddy can spawn
        buddy.vx = bg_speed - randint(1, 5)
    }
    
    if (kill_count >= 10 && recruits == 1) {
        // babe can spawn
        babe.vx = bg_speed - randint(1, 5)
        enemy_interval = enemy_interval + 1000
    }
    
    if (kill_count > 20) {
        dragon.sayText("Almost there...", 500)
        castle.vx = bg_speed
    }
    
})
// ======FRIENDS======
// recruit dragons
sprites.onOverlap(SpriteKind.call, SpriteKind.friend, function make_friend(call: Sprite, dragon: Sprite) {
    
    call.destroy()
    dragon.vx = 0
    if (recruits == 1) {
        // this is babe
        dragon.setPosition(25, dragon.y + 20)
        friend_img[2].flipX()
        friend_img[3].flipX()
    } else {
        // this is buddy
        dragon.setPosition(25, dragon.y - 20)
        friend_img[0].flipX()
        friend_img[1].flipX()
    }
    
    recruits += 1
})
// ======YOU DIED======
// befriended a human
sprites.onOverlap(SpriteKind.call, SpriteKind.human, function too_naive(call: Sprite, human: Sprite) {
    call.destroy()
    dragon.destroy()
    game.splash("You died, dumbass!", "Humans are NOT friends.")
    game.splash("Game will reset...")
    game.reset()
})
// killed your friends
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.friend, function evil(fire: Sprite, friend: Sprite) {
    fire.destroy()
    friend.destroy()
    dragon.destroy()
    game.splash("Wretched friend-killer!", "You've been slain, villain!")
    game.splash("Game will reset...")
    game.reset()
})
// ======THE END======
sprites.onOverlap(SpriteKind.castle, SpriteKind.Player, function you_win() {
    if (recruits == 2) {
        game.splash("Success!", "All requirements met!")
        game.over(true)
    } else {
        game.splash("You've been overpowered... :(")
        game.over(false)
    }
    
})
// bg set-up
scene.setBackgroundImage(assets.image`bg`)
