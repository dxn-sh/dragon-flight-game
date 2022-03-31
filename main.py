@namespace
class SpriteKind:
    cloud = SpriteKind.create()
    human = SpriteKind.create()
    friend = SpriteKind.create()
    call = SpriteKind.create()
    castle = SpriteKind.create()
    booster = SpriteKind.create()

class ActionKind(Enum):
    Flying = 0
    Roaring = 1
    Buddy_Fly = 2
    Babe_Fly = 3

#======VARIABLES======

speed = 40
bg_speed = -30
enemy_interval = 3000
kill_count = 0
recruits = 0
fire: Sprite = None   
buddy: Sprite = None
babe: Sprite = None
castle: Sprite = None
circle: Sprite = None
friend_img = [assets.image("buddy"), assets.image("buddy1"), assets.image("babe"),
assets.image("babe1")]

#======DRAGONS======

#player set-up
dragon = sprites.create(assets.image("dragon"), SpriteKind.player)
dragon.set_flag(SpriteFlag.STAY_IN_SCREEN, True)
dragon.set_position(30, 60)
dragon.z = 2

#create buddy off-screen
buddy = sprites.create(friend_img[0], SpriteKind.friend)
buddy.set_position(randint(200, 300), randint(40, 80))
buddy.z = 2

#create babe off-screen
babe = sprites.create(friend_img[2], SpriteKind.friend)
babe.set_position(randint(200, 300), randint(40, 80))
babe.z = 2

#creat castle off-screen
castle = sprites.create(assets.image("end"), SpriteKind.castle)
castle.x = 250
castle.z = 1

#flying - player
fly = animation.create_animation(ActionKind.Flying, 500)
fly.add_animation_frame(assets.image("dragon1"))
fly.add_animation_frame(assets.image("dragon"))
animation.attach_animation(dragon, fly)
animation.set_action(dragon, 0)

#flying - buddy
buddy_fly = animation.create_animation(2, 500)
buddy_fly.add_animation_frame(friend_img[1])
buddy_fly.add_animation_frame(friend_img[0])
animation.attach_animation(buddy, buddy_fly)
animation.set_action(buddy, 2)

#flying - babe
babe_fly = animation.create_animation(3, 500)
babe_fly.add_animation_frame(friend_img[3])
babe_fly.add_animation_frame(friend_img[2])
animation.attach_animation(babe, babe_fly)
animation.set_action(babe, 3)

#======PLAYER MECHANICS======

#player move
def move():
    if controller.up.is_pressed():
        dragon.vy = -speed
    elif controller.down.is_pressed():
        dragon.vy = speed
    else:
        dragon.vy = 0
game.on_update(move)

#friend call
def friend_req():
    call = sprites.create_projectile_from_sprite(assets.image("call"), dragon, 50, 0)
    call.x = 55
    call.set_kind(SpriteKind.call)
controller.B.on_event(ControllerButtonEvent.PRESSED, friend_req)

#shoot flames
def dragon_fire():
    global fire
    fire = sprites.create_projectile_from_sprite(assets.image("fire"), dragon, 50, 0)
    fire.x = 55
    fire.set_flag(SpriteFlag.DESTROY_ON_WALL, True)
    #dragon.say_text("ROAR!", 400)
controller.A.on_event(ControllerButtonEvent.PRESSED, dragon_fire)

#roaring
roar = animation.create_animation(ActionKind.Roaring, 500)
roar.add_animation_frame(assets.image("dragon_attack"))
animation.attach_animation(dragon, roar)

#roar when shoot fire
#def to_roar():
#    if fire != None and fire.x < 70:
#        animation.set_action(dragon, 1)
#    else:
#        animation.set_action(dragon, 0)
#game.on_update(to_roar)

#======CLOUDS======

#cloud spawn
def generate_cloud():
    cloud_pick = randint(0, 2)
    if cloud_pick == 0:
        cloud = sprites.create_projectile_from_side(assets.image("cloud0"), bg_speed, 0)
    elif cloud_pick == 1:
        cloud = sprites.create_projectile_from_side(assets.image("cloud1"), bg_speed, 0)
    elif cloud_pick == 2:
        cloud = sprites.create_projectile_from_side(assets.image("cloud2"), bg_speed, 0)
    cloud.y = randint(0, 121)
    cloud.z = 0
    cloud.set_kind(SpriteKind.cloud)
game.on_update_interval(2000, generate_cloud)

#======COLLECTIBLES======

#collectible spawn
def circle_spawn():
    global circle
    if Math.percent_chance(40):
        circle = sprites.create_projectile_from_side(assets.image("boost"), bg_speed, 0)
        circle.y = randint(0, 121)
        circle.z = 0
        circle.set_kind(SpriteKind.booster)
game.on_update_interval(2000, circle_spawn)

#actually collectible
def collecting(circle, dragon):
    global bg_speed, enemy_interval, speed
    circle.destroy() 
    dragon.say_text("Delicious.", 400)
    bg_speed = bg_speed - 10
    enemy_interval = enemy_interval - 500
    speed = speed + 2
sprites.on_overlap(SpriteKind.booster, SpriteKind.player, collecting)

#======ENEMIES======

#enemy spawn
def generate_enemy():
    if Math.percent_chance(60):
        balloon = sprites.create_projectile_from_side(assets.image("balloon"), bg_speed + 20, 0)
        balloon.y = randint(20, 100)
        balloon.z = 1
        balloon.set_kind(SpriteKind.human)
game.on_update_interval(enemy_interval, generate_enemy)

#destroy balloon + make friends + spawn the end
dying = ["ARGH!"]
def destroy_balloon(fire, human):
    global kill_count, castle, enemy_interval
    human.say_text(dying[randint(0, len(dying)-1)])
    human.destroy(effects.disintegrate, 200)
    fire.destroy()
    kill_count += 1
    if kill_count >= 5 and recruits == 0:
        #buddy can spawn
        buddy.vx = bg_speed - randint(1, 5)
    if kill_count >= 10 and recruits == 1:
        #babe can spawn
        babe.vx = bg_speed - randint(1, 5)
        enemy_interval = enemy_interval + 1000
    if kill_count > 20:
        dragon.say_text("Almost there...", 500)
        castle.vx = bg_speed
sprites.on_overlap(SpriteKind.projectile, SpriteKind.human, destroy_balloon)

#======FRIENDS======

#recruit dragons
def make_friend(call, dragon):
    global recruits
    call.destroy() 
    dragon.vx = 0
    if recruits == 1:
        #this is babe
        dragon.set_position(25, dragon.y + 20)
        friend_img[2].flip_x()
        friend_img[3].flip_x()
    else:
        #this is buddy
        dragon.set_position(25, dragon.y - 20)
        friend_img[0].flip_x()
        friend_img[1].flip_x()
    recruits += 1
sprites.on_overlap(SpriteKind.call, SpriteKind.friend, make_friend)

#======YOU DIED======

#befriended a human
def too_naive(call, human):
    call.destroy()
    dragon.destroy()
    game.splash("You died, dumbass!", "Humans are NOT friends.")
    game.splash("Game will reset...")
    game.reset()
sprites.on_overlap(SpriteKind.call, SpriteKind.human, too_naive)

#killed your friends
def evil(fire, friend):
    fire.destroy()
    friend.destroy()
    dragon.destroy()
    game.splash("Wretched friend-killer!", "You've been slain, villain!")
    game.splash("Game will reset...")
    game.reset() 
sprites.on_overlap(SpriteKind.projectile, SpriteKind.friend, evil)

#======THE END======

def you_win(): 
    if recruits == 2:
        game.splash("Success!", "All requirements met!")
        game.over(True) 
    else:
        game.splash("You've been overpowered... :(")
        game.over(False)
sprites.on_overlap(SpriteKind.castle, SpriteKind.player, you_win)

#bg set-up
scene.set_background_image(assets.image("bg"))