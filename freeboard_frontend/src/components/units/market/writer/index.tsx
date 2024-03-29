import { useForm } from "react-hook-form";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useMutationItemCreate } from "../../../commons/hooks/mutations/product/useMutationItemCreate";
import { useMutationItemUpdate } from "../../../commons/hooks/mutations/product/useMutationItemUpdate";
import { useAuth } from "../../../commons/hooks/customs/useAuth";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Modal } from "antd";
import DaumPostcodeEmbed, { Address } from "react-daum-postcode";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import * as W from "./writerStyles";
import {
  IQuery,
  IQueryFetchUseditemArgs,
} from "../../../commons/types/generated/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;

const FETCH_USEDITEM = gql`
  query fetchUseditem($useditemId: ID!) {
    fetchUseditem(useditemId: $useditemId) {
      _id
      name
      remarks
      contents
      price
      tags
      images
      seller {
        name
        _id
      }
      useditemAddress {
        address
      }
    }
  }
`;

declare const window: typeof globalThis & {
  kakao?: any;
};

interface IProps {
  isEdit: boolean;
}

interface IDataWriter {
  name: string;
  remarks: string;
  price: number;
  contents: string;
}

const schema = yup.object({
  name: yup.string().required("dddddd"),
});

export default function MarketWriterPage(props: IProps): JSX.Element {
  useAuth();
  const router = useRouter();
  const { data } = useQuery<
    Pick<IQuery, "fetchUseditem">,
    IQueryFetchUseditemArgs
  >(FETCH_USEDITEM, {
    variables: {
      useditemId: String(router.query.number),
    },
  });

  const { register, handleSubmit, trigger, setValue, formState } =
    useForm<IDataWriter>({
      mode: "onChange",
      resolver: yupResolver(schema),
    }); // 나중에 에러 잡을때 contents는 트리거 안에 넣어주기!!
  const [create_used_item] = useMutationItemCreate();
  const [update_used_item] = useMutationItemUpdate();
  const [imageUrls, setImageUrls] = useState(["", "", ""]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState("");

  const [upload_file] = useMutation(UPLOAD_FILE);
  const [isOpen, setIsOpen] = useState(false);

  const [address, setAddress] = useState(
    data?.fetchUseditem?.useditemAddress?.address
  );

  // 실질적인 이미지 버튼1
  const onChangeImageUpload =
    (index: number) => async (event: ChangeEvent<HTMLInputElement>) => {
      console.log("djkdlsjslfkdjl", index);
      const file = event.target.files?.[0]; // file.name = "imageSrc1.png"
      const result = await upload_file({
        variables: { file: file },
      });
      onChangeImageUrls(result.data?.uploadFile.url, index);
      //  result.data?.uploadFile.url = imageSrc1.png
    };

  // 이미지 버튼 함수2
  const onChangeImageUrls = (imageUrl: string, index: number) => {
    const newImageUrls = [...imageUrls]; // newImageUrls = ["", "", ""] // 얕은 복사
    newImageUrls[index] = imageUrl; // ["imageSrc1.png" , "", ""] = "imageSrc1.png" // 인덱스가 0일 경우
    setImageUrls(newImageUrls); // ["imageSrc1.png" , "", ""] = "imageSrc1.png" // 인덱스가 0일 경우
  };

  // 숨겨진 이미지 버튼3
  const onClickImageNonoMode = () => {
    if (fileRef.current !== null) {
      fileRef.current.click();
    }
  };
  // useRef는 각각 써줘야 한다!!
  // 그래서 멘토님께서 이미지 컴포넌트를 나누어서 한거다

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ align: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, "link"],
        [
          {
            color: [
              "#000000",
              "#e60000",
              "#ff9900",
              "#ffff00",
              "#008a00",
              "#0066cc",
              "#9933ff",
              "#ffffff",
              "#facccc",
              "#ffebcc",
              "#ffffcc",
              "#cce8cc",
              "#cce0f5",
              "#ebd6ff",
              "#bbbbbb",
              "#f06666",
              "#ffc266",
              "#ffff66",
              "#66b966",
              "#66a3e0",
              "#c285ff",
              "#888888",
              "#a10000",
              "#b26b00",
              "#b2b200",
              "#006100",
              "#0047b2",
              "#6b24b2",
              "#444444",
              "#5c0000",
              "#663d00",
              "#666600",
              "#003700",
              "#002966",
              "#3d1466",
              "custom-color",
            ],
          },
          { background: [] },
        ],
        ["image", "video"],
        ["clean"],
      ],
    },
  };

  interface IDataWriter {
    name: string;
    remarks: string;
    price: number;
    contents: string;
    tag: string;
  }
  // 상품 등록 버튼
  const onClickCreateProduct = async (data: IDataWriter) => {
    const result = await create_used_item({
      variables: {
        createUseditemInput: {
          name: data.name,
          remarks: data.remarks,
          price: Number(data.price),
          contents: data.contents,
          tags: data.tag
            .replaceAll(" ", "")
            .split("#")
            .filter((el: string) => el !== "")
            .map((el) => "#" + el),
          images: [...imageUrls],
          useditemAddress: {
            address: address,
          },
        },
      },
    });
    alert("상품 등록하였습니다.");

    router.push("/markets/market/" + result.data.createUseditem._id);
  };

  interface IDataEdit {
    name: string;
    remarks: string;
    price: number;
    contents: string;
    tag: string;
  }
  // 상품 수정 버튼
  const onClickUpdateProduct = async (data: IDataEdit): Promise<void> => {
    try {
      const result = await update_used_item({
        variables: {
          updateUseditemInput: {
            name: data.name,
            remarks: data.remarks,
            price: Number(data.price),
            contents: data.contents,
            tags: data.tag
              .replaceAll(" ", "")
              .split("#")
              .filter((el: string) => el !== "")
              .map((el) => "#" + el),
            useditemAddress: {
              address: address,
            },
          },
          useditemId: router.query.number,
        },
      });

      alert("상품 수정하였습니다.");
      router.push("/markets/market/" + result.data?.updateUseditem._id);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  //

  //   카카오맵 지도

  useEffect(() => {
    setAddress(
      address ? address : data?.fetchUseditem?.useditemAddress?.address
    );

    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=546bab6b1ad8e036b1f679bbb9af2e7c&libraries=services";

    document.head.appendChild(script);

    script.onload = () => {
      // 스크립트 태그를 다운받아 오면은
      window.kakao.maps.load(function () {
        let mapContainer = document.getElementById("map"), // 지도를 표시할 div
          mapOption = {
            center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
            level: 3, // 지도의 확대 레벨
            disableDoubleClickZoom: true,
          };

        let map = new window.kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

        // 주소-좌표 변환 객체를 생성합니다
        let geocoder = new window.kakao.maps.services.Geocoder();

        map.setDraggable(false);
        map.setZoomable(false);

        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(address, function (result: any, status: any) {
          // 요 aeeress는 주소 라이브러리의 api를 불러와 주소값을 저장함
          // 정상적으로 검색이 완료됐으면
          if (status === window.kakao.maps.services.Status.OK) {
            let coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            let marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            // 인포윈도우로 장소에 대한 설명을 표시합니다
            let infowindow = new window.kakao.maps.InfoWindow({
              content: address, // 주소 라이브러리의 api를 불러와 저장된 주소값을 저장
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
          }
        });
      });
    };
  }, [address, data?.fetchUseditem.useditemAddress?.address]);

  //

  //

  //

  const handleComplete = (Data: Address) => {
    addressShowModal();
    setAddress(Data.address);
    // setZipcode(data.zipcode);
  };

  const addressShowModal = () => {
    setIsOpen((prev) => !prev);
  };

  const [qqq, setQqq] = useState("");

  const onChangeContents = (value: string) => {
    setValue(
      "contents",
      value === "<p><br></p>" ? data?.fetchUseditem?.contents ?? "" : value
    );

    setQqq(value === "<p><br>p>" ? data?.fetchUseditem.contents ?? "" : value);
  };

  return (
    <W.MainWrapper>
      <W.SubWrapper>
        <form
          onSubmit={
            props.isEdit
              ? handleSubmit(onClickUpdateProduct)
              : handleSubmit(onClickCreateProduct)
          }
        >
          <div>상품명</div>
          <W.InputStyle01
            {...register("name")}
            defaultValue={data?.fetchUseditem.name}
          ></W.InputStyle01>
          {/* <div>요약</div> */}
          <div>요약 {formState.errors.name?.message}</div>

          <W.InputStyle01
            {...register("remarks")}
            defaultValue={data?.fetchUseditem.remarks}
          ></W.InputStyle01>
          <div>가격</div>
          <W.InputStyle01
            {...register("price")}
            defaultValue={Number(data?.fetchUseditem.price ?? "")}
          ></W.InputStyle01>
          <div>상품 내용 </div>
          <W.ReactQuill2
            onChange={onChangeContents}
            modules={modules}
            value={qqq ? qqq : data?.fetchUseditem.contents}
            // {...register("contents")}
          ></W.ReactQuill2>
          <div>
            <div>태그 입력</div>
            <input
              style={{ width: 500 }}
              {...register("tag")}
              defaultValue={data?.fetchUseditem?.tags?.join("")}
            ></input>
          </div>

          <div>이미지 등록</div>

          {imageUrls.map((el, index) => (
            <div key={uuidv4()} style={{ margin: 30 }}>
              <img
                style={{ width: 50, height: 50 }}
                // onClick={onClickImageNonoMode}
                src={"https:/storage.googleapis.com/" + imageUrls[index]}
                onClick={onClickImageNonoMode}
              ></img>
              <input
                type="file"
                ref={fileRef}
                onChange={onChangeImageUpload(index)}
              ></input>
            </div>
          ))}
          <div>
            <div id="map" style={{ width: 500, height: 400 }}></div>
            <div>
              <button
                type="button"
                onClick={addressShowModal}
                style={{ background: "red" }}
              >
                주소 등록
              </button>
            </div>
          </div>
          <button>{props.isEdit ? "상품수정" : "상품등록"}</button>
        </form>

        {isOpen && (
          <Modal
            title="주소"
            open={isOpen}
            onOk={addressShowModal}
            onCancel={addressShowModal}
          >
            <DaumPostcodeEmbed onComplete={handleComplete}></DaumPostcodeEmbed>
          </Modal>
        )}
      </W.SubWrapper>
    </W.MainWrapper>
  );
}
