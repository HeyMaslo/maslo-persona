export class LineController {
  constructor() {
    this.node = document.getElementById('lineController');

    this.slider = /** @type {HTMLElement} */ (this.node.querySelectorAll('.slider')[0]);

    this.originDrag = 0;
    this.dragginPosition = 0;
    this.position = 0;
    this.vals = {
      joy: 0,
      love: 0,
      surprise: 0,
      terror: 0,
      sadness: 0,
      anger: 0,
      sleepy: 0,
      calm: 0,
    };

    this.slider.addEventListener('mousedown', this.mouseDown);
    document.body.addEventListener('mousemove', this.mouseMove);
    document.body.addEventListener('mouseup', this.mouseUp);
  }

  mouseDown = (e) => {
    this.dragging = true;
    this.originDrag = e.screenX;
    this.dragginPosition = e.screenX;
    this.position = 0;
  }

  mouseUp = () => {
    this.dragging = false;
  }

  mouseMove = (e) => {
    if (this.dragging) {
      this.dragginPosition = e.screenX;
    }
  }

  step() {
    // slider position
    if (this.dragging) {
      this.position = this.dragginPosition - this.originDrag;
    } else {
      this.position = this.position - this.position * 0.1;
    }

    // influences
    const val = Math.max(-1, Math.min(1, this.position / (this.node.offsetWidth / 2)));

    let joy;
    let love;
    let sadness;

    if (val > 0) {
      joy = Math.max(0, 1 - Math.sqrt((val - 0.5) ** 2) / 0.5);
      love = Math.max(0, (val - 0.5) / 0.5);
    } else {
      joy = 0;
      love = 0;
    }
    if (val <= 0) {
      sadness = Math.abs(val);
    } else {
      sadness = 0;
    }

    this.vals.joy = joy;
    this.vals.love = love;
    this.vals.sadness = sadness;

    this.slider.style.transform = `translate3d( ${this.position}px, 0px, 0px )`;
  }

  dispose() {
    this.slider.removeEventListener('mousedown', this.mouseDown);
    document.body.removeEventListener('mousemove', this.mouseMove);
    document.body.removeEventListener('mouseup', this.mouseUp);
  }
}
