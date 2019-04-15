
export class CircleController {

  constructor() {
    this.node = document.getElementById('circleController');

    this.slider = /** @type {HTMLElement} */ (this.node.querySelectorAll('.slider')[0]);
    this.feelings = document.querySelectorAll('.feeling');

    this.vals = {};
    this.originDrag = { x: 0, y: 0 };
    this.dragginPosition = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.distance = 0;
    this.angle = 0;
    this.titles = {};

    for (let i = 0; i < this.feelings.length; i++) {
      const feelingNode = /** @type {HTMLElement} */ (this.feelings[i]);
      this.titles[feelingNode.getAttribute('id')] = feelingNode.innerHTML;
      const p = {
        id: feelingNode.getAttribute('id'),
        x: Math.cos(Math.PI * 2 * i / this.feelings.length) * this.node.offsetWidth / 2,
        y: -Math.sin(Math.PI * 2 * i / this.feelings.length) * this.node.offsetWidth / 2,
      };
      feelingNode.style.transform = `translate3d( ${p.x}px, ${p.y}px, 0px )`;
      this.vals[feelingNode.getAttribute('id')] = 0;
    }

    this.slider.addEventListener('mousedown', this.mouseDown);
    document.body.addEventListener('mousemove', this.mouseMove);
    document.body.addEventListener('mouseup', this.mouseUp);
  }

  mouseDown = (e) => {
    this.dragging = true;
    this.originDrag = { x: e.screenX, y: e.screenY };
    this.dragginPosition = { x: e.screenX, y: e.screenY };
    this.position = { x: 0, y: 0 };
  }

  mouseUp = () => {
    this.dragging = false;
  }

  mouseMove = (e) => {
    if (this.dragging) {
      this.dragginPosition = { x: e.screenX, y: e.screenY };
    }
  }

  step = () => {
    // slider position
    if (this.dragging) {
      this.position = {
        x: this.dragginPosition.x - this.originDrag.x,
        y: this.dragginPosition.y - this.originDrag.y,
      };
    } else {
      this.position = { x: this.position.x - this.position.x * 0.1, y: this.position.y - this.position.y * 0.1 };
    }

    // influences
    const minDist = 0.02;
    let angle = Math.atan2(-this.position.y, this.position.x);
    if (angle < 0) {
      angle = Math.PI + (Math.PI + angle);
    }

    let dist = Math.sqrt((this.position.x ** 2) + (this.position.y ** 2)) / (this.node.offsetWidth / 2);
    dist = Math.min(1, Math.max(0, (dist - minDist) / (1 - minDist)));
    const angleInc = Math.PI * 2 / this.feelings.length;

    if (angle > angleInc * 7) {
      const inf = (angle - angleInc * 7) / angleInc;
      this.vals[this.feelings[0].getAttribute('id')] = inf * dist;
      this.vals[this.feelings[7].getAttribute('id')] = (1 - inf) * dist;
    } else {
      for (let i = 0; i < this.feelings.length; i++) {
        const inf = Math.max(0, 1 - Math.abs((angleInc * i - angle) / angleInc)) * dist;
        this.vals[this.feelings[i].getAttribute('id')] = inf;
      }
    }

    Object.keys(this.vals).forEach((val) => {
      if (this.vals[val] === 0) {
        document.getElementById(val).innerHTML = this.titles[val];
      } else {
        document.getElementById(val).innerHTML = `${Math.round(this.vals[val] * 100)}%`;
      }
    });

    this.slider.style.transform = `translate3d( ${this.position.x}px, ${this.position.y}px, 0px )`;
  }

  dispose() {
    this.slider.removeEventListener('mousedown', this.mouseDown);
    document.body.removeEventListener('mousemove', this.mouseMove);
    document.body.removeEventListener('mouseup', this.mouseUp);
  }
}
