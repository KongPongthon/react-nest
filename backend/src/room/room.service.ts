import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  private readonly room = [
    { id: 1, name: 'room1' },
    { id: 2, name: 'room2' },
    { id: 3, name: 'room3' },
  ];

  findAll() {
    return this.room;
  }

  create(room) {
    this.room.push(room);
    return this.room;
  }
}
