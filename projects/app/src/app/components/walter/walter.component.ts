import { Component, ElementRef, HostBinding, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'walter',
  templateUrl: './walter.component.html',
  styleUrls: ['./walter.component.scss']
})
export class GunShotComponent {
  @ViewChild("walter") walter!: ElementRef<HTMLElement>;
  enabled = false;
  shots = 0;

  constructor(public elRef: ElementRef<HTMLElement>) { }

  @HostListener('window:click', ['$event'])
  click(event: MouseEvent) {
    if(!this.enabled) { return; }
    const el = document.querySelector('#gunshot') as HTMLElement;

    const bulletHole = el.cloneNode() as HTMLElement;
    this.elRef.nativeElement.append(bulletHole);

    bulletHole.style.display = 'block';
    bulletHole.style.position = 'absolute';

    bulletHole.style.left = event.clientX - bulletHole.offsetWidth + 'px';
    bulletHole.style.top = event.clientY - bulletHole.offsetHeight + 'px';

    const shotSound = new Audio();
    shotSound.src = "shotgun.mp3";
    shotSound.play();

    this.shots++;

    const timer = setTimeout(() => {
      this.elRef.nativeElement.removeChild(bulletHole);
      clearTimeout(timer);
    }, Math.random() * 5000 + 1000);
  }

  @HostBinding() color = '#eee';

  toggleMode(event: Event) {
    event.stopPropagation();
    this.enabled = !this.enabled;
    this.walter.nativeElement.style.backgroundColor = this.enabled ? '#e03a3a' : '#eee';
  }
}
