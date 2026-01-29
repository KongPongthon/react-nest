import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  nameRoom: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class DeleteRoomDto {
  roomId: number;
}
