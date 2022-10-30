import Subject from '../models/subject';

export async function createSubject({ name, code }: { name: string, code: string }) {
  return Subject.create({ name, code });
}

export async function findAllSubjects() {
  return Subject.findAll({});
}
