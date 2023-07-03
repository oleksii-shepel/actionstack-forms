import { Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore, doc, getDoc, increment, updateDoc } from '@angular/fire/firestore';
import { walter } from '../../animations/animations';

@Component({
  selector: 'walter',
  templateUrl: './walter.component.html',
  styleUrls: ['./walter.component.scss'],
  animations: [walter]
})
export class WalterComponent implements OnInit {
  @ViewChild("walter") walter!: ElementRef<HTMLElement>;
  enabled = false;
  shots = 0;
  firestore: Firestore = inject(Firestore);

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

    const documentRef = doc(this.firestore, 'statistics/xeEFpi8UCnJjMexo2raf');
    updateDoc(documentRef, { totalShots: increment(1) });

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
    const statistics = this.elRef.nativeElement.querySelector('.statistics') as HTMLElement;
    if(statistics) {
      statistics.style.display = this.enabled ? 'block' : 'none';
    }
    this.walter.nativeElement.style.backgroundColor = this.enabled ? '#e03a3a' : '#eee';
  }
}
