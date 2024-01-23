class GameItem extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, number, i, j) {
    super(scene, x, y)

    this.number = number
    this.width = width
    this.i = i
    this.j = j

    this.rect = scene.add.rexRoundRectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: this.width,
      radius: Math.floor(this.width / 10),
      color: 0xffffff,
      alpha: 0,
      strokeColor: 0x2d2d2d,
      strokeWidth: 2,
    })

    this.text = scene.add.text(0, 0, this.number, {
      fontSize: this.width / 2,
      color: '#000',

      fontFamily: 'Arial',
    })
    this.add([this.rect, this.text])

    this.setSize(this.width, this.width)

    Phaser.Display.Align.In.Center(this.text, this.rect)

    scene.add.existing(this)

    if (this.number === 0) {
      this.setVisible(false)
    }

    this.setInteractive()
  }
}

export default GameItem
