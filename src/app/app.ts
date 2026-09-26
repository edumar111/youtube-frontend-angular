import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header';
import { ChatWidget } from './shared/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
