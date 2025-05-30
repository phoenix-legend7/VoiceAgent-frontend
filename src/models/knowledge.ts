interface KnowledgeType {
  filename: string
  description: string
  size: number
}

export interface KnowledgeRead {
  id: string;
  name: string;
  file_type: string;
  create_at: number;
  description: string;
  size: number;
}

export default KnowledgeType
