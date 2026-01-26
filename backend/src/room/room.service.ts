import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  private readonly room = [
    { id: 1, name: 'room1', key: 'room1' },
    { id: 2, name: 'room2', key: 'room2' },
    { id: 3, name: 'room3', key: 'room3' },
  ];

  findAll() {
    return this.room;
  }

  create(room: { name: string; topic: string }): {
    id: number;
    name: string;
    key: string;
  } {
    const data = {
      id: this.room.length + 1,
      name: room.name,
      key: `${room.name}ssss`,
    };
    this.room.push(data);
    return data;
  }
}
