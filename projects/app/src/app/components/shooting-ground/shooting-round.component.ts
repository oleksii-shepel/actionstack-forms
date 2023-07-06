import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore, doc, getDoc, increment, updateDoc } from '@angular/fire/firestore';
import { walter } from '../../animations/animations';

@Component({
  selector: 'shooting-ground',
  templateUrl: './shooting-ground.component.html',
  styleUrls: ['./shooting-ground.component.scss'],
  animations: [walter]
})
export class ShootingGroundComponent implements OnInit {
  @ViewChild("walter") walter!: ElementRef<HTMLElement>;
  enabled = false;
  targetEnabled = true;
  displayHoles = true;

  shots = 0;

  firestore: Firestore = inject(Firestore);

  objects = new Set<HTMLElement>();
  timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(public elRef: ElementRef<HTMLElement>) {}

  async ngOnInit() {
    const documentRef = doc(this.firestore, 'statistics/xeEFpi8UCnJjMexo2raf');
    const snapShotData = (await getDoc(documentRef)).data();
    if(snapShotData) {
      this.shots = snapShotData['totalShots'];
    }
  }

  @HostListener('window:click', ['$event'])
  click(event: MouseEvent) {
    if(!this.enabled) { return; }

    const documentRef = doc(this.firestore, 'statistics/xeEFpi8UCnJjMexo2raf');
    updateDoc(documentRef, { totalShots: increment(1) });

    this.shots++;

    if(this.displayHoles) {
      const el = document.querySelector('#gunshot') as HTMLElement;

      const bulletHole = el.cloneNode() as HTMLElement;
      this.elRef.nativeElement.append(bulletHole);
      this.objects.add(bulletHole);

      bulletHole.style.display = 'block';
      bulletHole.style.position = 'absolute';

      bulletHole.style.left = event.clientX - bulletHole.offsetWidth + 'px';
      bulletHole.style.top = event.clientY - bulletHole.offsetHeight + 'px';

      const timer = setTimeout(() => {
        this.elRef.nativeElement.removeChild(bulletHole);
        clearTimeout(timer);
      }, Math.random() * 5000 + 1000);

      this.timers.add(timer);
    }

    const shotSound = new Audio();
    shotSound.src = "shotgun.mp3";
    shotSound.play();
  }

  toggleMode(event: Event) {
    event.stopPropagation();
    this.enabled = !this.enabled;
    const statistics = this.elRef.nativeElement.querySelector('.statistics') as HTMLElement;
    if(statistics) {
      statistics.style.display = this.enabled ? 'block' : 'none';
    }
    this.walter.nativeElement.style.backgroundColor = this.enabled ? '#e03a3a' : '#eee';

    if(this.enabled && this.targetEnabled) {
      const el = document.querySelector('#target') as HTMLElement;
      let delay = 0;
      for(let i = 0; i < 7; i++) {
        delay += Math.random() * 5000 + 1000;

        const timer = setTimeout(() => {
          const target = el.cloneNode(true) as HTMLElement;
          this.elRef.nativeElement.append(target);
          this.objects.add(target);

          target.style.display = 'block';
          target.style.position = 'absolute';

          const positionX = Math.floor((window.innerWidth - target.offsetWidth) * Math.random());
          const positionY = Math.floor((window.innerHeight - target.offsetHeight) * Math.random());

          target.style.left = positionX + 'px';
          target.style.top = positionY + 'px';

          target.addEventListener('click', (event) => {
            event.stopPropagation();
            target.classList.add('hit');

            const documentRef = doc(this.firestore, 'statistics/xeEFpi8UCnJjMexo2raf');
            updateDoc(documentRef, { totalShots: increment(1) });

            this.shots++;

            const shotSound = new Audio();
            shotSound.src = "shotgun.mp3";
            shotSound.play();
          });

          clearTimeout(timer);
          const timer2 = setTimeout(() => {
            if(!target.classList.contains('hit')) {
              target.classList.add('missed');

              const laugh = new Audio();
              laugh.src = "villain-laugh.mp3";
              laugh.play();
            }

            const timer3 = setTimeout(() => {
              this.elRef.nativeElement.removeChild(target);
              clearTimeout(timer3);
            }, 2000);
            this.timers.add(timer3);
            clearTimeout(timer2);
          }, Math.random() * 5000 + 1000);
          this.timers.add(timer2);
        }, delay);
        this.timers.add(timer);
      }
    } else {
      this.objects.forEach((object) => {
        this.elRef.nativeElement.removeChild(object);
      });
      this.timers.forEach((timer) => {
        clearTimeout(timer);
      });
    }
  }
}
