import { useQuery } from "@tanstack/vue-query"
import axios from "axios"
import type { Todo } from "../type/todo"

const BASE_URL = "https://jsonplaceholder.typicode.com";

const useTodoList = () => {

  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await axios.get<Todo[]>(`${BASE_URL}/posts`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  })

}

export { useTodoList }
