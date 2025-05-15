import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation'; // Importar Geolocation de Capacitor

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class HomePage implements OnInit {
  latitude: number | null = null;
  longitude: number | null = null;
  mapUrl: string | null = null;

  private firestore: Firestore = inject(Firestore); // Inyectar Firestore

  constructor() {}

  // Solicitar permisos de ubicación en ngOnInit
  async ngOnInit(): Promise<void> {
    // Solicita permisos de ubicación
    await Geolocation.requestPermissions();
    this.getCurrentLocation(); // Obtener ubicación automáticamente después de obtener permisos
  }

  // Función para obtener la ubicación actual
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocalización no está soportada en este navegador.');
      return;
    }

    // Uso de una promesa para manejar la geolocalización
    new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.generateMapUrl(); // Generar la URL de Google Maps
          resolve(); // Resolver la promesa cuando se obtienen las coordenadas
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          reject(error); // Rechazar la promesa si hay un error
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    })
      .then(() => {
        this.saveUrlToFirestore(); // Guardar la URL después de obtener las coordenadas
      })
      .catch((error) => {
        console.error('Error en la obtención de ubicación:', error);
      });
  }

  // Generar la URL de Google Maps
  generateMapUrl(): void {
    if (this.latitude !== null && this.longitude !== null) {
      this.mapUrl = `https://www.google.com/maps/@${this.latitude},${this.longitude}`;
    }
  }

  // Guardar la URL en Firestore
  async saveUrlToFirestore(): Promise<void> {
    if (this.mapUrl) {
      try {
        const docRef = await addDoc(collection(this.firestore, 'ubicaciones'), {
          url: this.mapUrl,
          nombre: 'Isaac Valenzuela', // Cambia esto si es necesario
        });
        console.log('URL guardada en Firestore con ID: ', docRef.id);
      } catch (e) {
        console.error('Error guardando la URL en Firestore: ', e);
      }
    }
  }
}