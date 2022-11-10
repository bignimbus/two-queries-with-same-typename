/*** APP ***/
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
} from "@apollo/client";

import { link } from "./link.js";
import "./index.css";

const ALL_PEOPLE = gql`
  query AllPeople {
    people {
      id
      name
    }
  }
`;

const CURRENT_PERSON = gql`
  query CurrentPerson {
    currentPerson {
      id
      name
    }
  }
`;

const ADD_PERSON = gql`
  mutation AddPerson($name: String) {
    addPerson(name: $name) {
      id
      name
    }
  }
`;

function App() {
  const [name, setName] = useState('');
  // const {
  //   data: peopleData,
  //   loading: peopleLoading,
  // } = useQuery(ALL_PEOPLE);

  const {
    refetch: currentPersonRefetch,
    data: currentPersonData,
    loading: currentPersonLoading,
  } = useQuery(CURRENT_PERSON);

  const [addPerson] = useMutation(ADD_PERSON, {
    update: (cache, { data: { addPerson: addPersonData } }) => {
      const peopleResult = cache.readQuery({ query: ALL_PEOPLE });

      cache.writeQuery({
        query: ALL_PEOPLE,
        data: {
          ...peopleResult,
          people: [
            ...peopleResult.people,
            addPersonData,
          ],
        },
      });
    },
  });

  return (
    <main>
      <h1>Apollo Client Issue Reproduction</h1>
      <p>
        This application can be used to demonstrate an error in Apollo Client.
      </p>
      <div className="add-person">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={evt => setName(evt.target.value)}
        />
        <button
          onClick={() => {
            addPerson({ variables: { name } });
            setName('');
          }}
        >
          Add person
        </button>
      </div>
      <h2>Current Person</h2>
      {currentPersonLoading ? (
        <p>Loading…</p>
      ) : (
        <>
          <p>
            { currentPersonData?.currentPerson?.id }: { currentPersonData?.currentPerson?.name }
          </p>
          <div>
            <button type="button" onClick={() => currentPersonRefetch()}>Refetch</button>
          </div>
        </>
      )}
      {/*
      <h2>Names</h2>
      {peopleLoading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {peopleData?.people.map(person => (
            <li key={person.id}>{person.name}</li>
          ))}
        </ul>
      )}
      */}
    </main>
  );
}

const client = new ApolloClient({
  link,
  connectToDevTools: true,
  cache: new InMemoryCache(),
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
