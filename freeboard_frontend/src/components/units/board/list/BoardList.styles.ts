import styled from "@emotion/styled";

export const Wrapper = styled.div`
  color: black;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: #282424;  */
  justify-content: center;
  align-items: center;
`;

export const MainTalbe = styled.table`
  border-bottom: 1px solid black;
  border-top: 1px solid black;
  border-collapse: collapse;
  width: 100%;
  text-align: center;
`;

export const TableHead = styled.th`
  border-bottom: 1px solid #bdbdbd;
  height: 52px;
`;

export const TableData = styled.td`
  border-bottom: 1px solid #bdbdbd;
  height: 52px;
  cursor: pointer;
`;

export const ListWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 280px;
`;

export const SearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 280px;
`;
// export const ListButton = styled.button`
//   border: none;
//   background-color: white;
//   margin: 10px;
// `;

// export const ListNextButton = styled.button`
//   border: none;
//   background-color: white;
//   margin: 10px;
//   font-weight: 700;
// `;

export const WriterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-top: 40px;
  /* margin-top: 20px; */
  /* margin-bottom: 50px; */
`;

export const WriterButton = styled.button`
  width: 171px;
  height: 52px;
  border: 1px solid black;
  /* border-radius: 10px;  */
  cursor: pointer;
  margin-left: 650px;
`;
