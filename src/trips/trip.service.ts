import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { Member } from 'src/member/entities/member.entity';
// import { UserRepository } from 'src/auth/user.repository';
// import { User } from 'src/auth/user.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>, // MemberRepository 추가
  ) {}

  async createTrip(tripData: Partial<Trip>, memberPayload: any): Promise<Trip> {
    const member = await this.memberRepository.findOne({
      where: { id: memberPayload.sub }, // member.sub을 이용해 데이터베이스에서 조회
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    console.log('Found member:', member); // 조회된 member 로그 출력

    const trip = this.tripsRepository.create({
      ...tripData,
      member: member,
    });
    return await this.tripsRepository.save(trip);
  }

  async getAllTrips(): Promise<Trip[]> {
    return await this.tripsRepository.find({ where: { is_deleted: false } });
  }

  async updateTrip(id: number, tripData: Partial<Trip>): Promise<Trip> {
    await this.tripsRepository.update(id, tripData);
    const updatedTrip = await this.tripsRepository.findOne({
      where: { id }, // 수정된 부분
    });
    if (!updatedTrip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<void> {
    const result = await this.tripsRepository.update(id, { is_deleted: true });
    if (result.affected === 0) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
  }
}
