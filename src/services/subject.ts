import Subject from '../models/subject';

export async function createSubject({ name, code }: { name: string, code: string }) {
  return Subject.create({ name, code });
}

export async function findAllSubjects() {
  return Subject.findAll({});
}

export async function findSubject({ subjectId }: { subjectId: string }) {

  return Subject.findOne({ where: { id: Number(subjectId) }});
}

export async function updateSubject(id: string, attrs: { name?: string, code?: string }) {

  const target = await Subject.findOne({ where: { id: Number(id) }});

  if (target) {
    await target.update(attrs)

    await target.reload();
    return target;
  }

  console.log('notfound with id', { id })
}
