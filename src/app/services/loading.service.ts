import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private _messageSubject = new BehaviorSubject<string>('');
    private timeoutRef: number | null = null;

    constructor(private ngxService: NgxUiLoaderService) {
    }

    get message$() {
        return this._messageSubject.asObservable();
    }

    get message() {
        return this._messageSubject.value;
    }

    set message(message: string) {
        this._messageSubject.next(message);
    }

    // Inicia loader de fondo
    startBackground(taskId?: string) {
        this.ngxService.startBackground(taskId);
    }

    // Detiene loader de fondo
    stopBackground(taskId?: string) {
        this.ngxService.stopBackground(taskId);
    }

    // Inicia loader con mensaje personalizable
    start(opts?: { taskId?: string; message?: string }) {
        // Limpiar timeout anterior si existe
        this.clear();

        this._messageSubject.next(opts?.message ?? '');
        this.ngxService.start(opts?.taskId);
    }

    // Detiene loader y limpia mensajes
    stop(taskId?: string) {
        taskId ? this.ngxService.stopAll() : this.ngxService.stop(taskId);

        // Limpiar el mensaje inmediatamente
        this._messageSubject.next('');
        
        // Limpiar timeout anterior si existe
        this.clear();
    }

    // Limpia timeouts pendientes
    clear() {
        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef);
            this.timeoutRef = null;
        }
    }
}
